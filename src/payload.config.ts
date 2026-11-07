import { postgresAdapter } from '@payloadcms/db-postgres'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig, type Plugin } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { BulkUploadBatches } from './collections/BulkUploadBatches'
import { BulkUploadRows } from './collections/BulkUploadRows'
import { Categories } from './collections/Categories'
import { Cameras, Lenses } from './collections/Gear'
import { Locations } from './collections/Locations'
import { Media } from './collections/Media'
import { PhotoCollections } from './collections/PhotoCollections'
import { Photos } from './collections/Photos'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Cloud storage for photos and media. Works with AWS S3 and any S3-compatible provider
 * (Backblaze B2, Cloudflare R2, …) via S3_ENDPOINT. Without S3_BUCKET, files are stored
 * on local disk, which is fine for development.
 */
const storagePlugins: Plugin[] = process.env.S3_BUCKET
  ? [
      s3Storage({
        collections: {
          photos: { prefix: 'photos' },
          media: { prefix: 'media' },
        },
        bucket: process.env.S3_BUCKET,
        clientUploads: true,
        config: {
          region: process.env.S3_REGION || 'auto',
          endpoint: process.env.S3_ENDPOINT || undefined,
          forcePathStyle: Boolean(process.env.S3_ENDPOINT),
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
          },
        },
      }),
    ]
  : []

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' — Of Wild & Walls',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Photos,
    Categories,
    PhotoCollections,
    Locations,
    Tags,
    Cameras,
    Lenses,
    Media,
    BulkUploadBatches,
    BulkUploadRows,
    Users,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Schema changes go through migrations (pnpm migrate:create / pnpm migrate), never auto-push.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [
    nestedDocsPlugin({
      collections: ['categories'],
      generateLabel: (_, doc) => String(doc.name ?? ''),
      generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
    }),
    ...storagePlugins,
  ],
})
