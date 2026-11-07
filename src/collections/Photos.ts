import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { isAdmin, publicWhenStatus } from '@/access'
import { slugField } from '@/fields/slug'
import { findOrCreateGear, makePlaceholder, readPhotoExif } from '@/lib/exif'

const isEmpty = (value: unknown) => value === undefined || value === null || value === ''

/**
 * When a file is uploaded (single upload or bulk job), read its EXIF and fill any field
 * the admin left empty. Values the admin typed are never overwritten.
 */
const fillFromFile: CollectionBeforeChangeHook = async ({ data, req }) => {
  const buffer = req.file?.data
  if (!buffer) return data

  const [exif, preview] = await Promise.all([readPhotoExif(buffer), makePlaceholder(buffer)])

  if (isEmpty(data.camera) && exif.cameraName) {
    data.camera = await findOrCreateGear(req, 'cameras', exif.cameraName, exif.cameraMake)
  }
  if (isEmpty(data.lens) && exif.lensName) {
    data.lens = await findOrCreateGear(req, 'lenses', exif.lensName, exif.lensMake ?? exif.cameraMake)
  }
  if (isEmpty(data.aperture) && exif.aperture !== undefined) data.aperture = exif.aperture
  if (isEmpty(data.shutterSpeed) && exif.shutterSpeed) data.shutterSpeed = exif.shutterSpeed
  if (isEmpty(data.iso) && exif.iso !== undefined) data.iso = exif.iso
  if (isEmpty(data.focalLengthMm) && exif.focalLengthMm !== undefined) data.focalLengthMm = exif.focalLengthMm
  if (isEmpty(data.takenAt) && exif.takenAt) data.takenAt = exif.takenAt
  if (exif.raw) data.exifRaw = exif.raw
  if (preview.placeholder) data.placeholder = preview.placeholder
  if (preview.dominantColor) data.dominantColor = preview.dominantColor

  return data
}

/** Year filter reads `takenYear`, kept in step with `takenAt`. */
const setTakenYear: CollectionBeforeChangeHook = ({ data }) => {
  if (data.takenAt) {
    const year = new Date(data.takenAt).getUTCFullYear()
    data.takenYear = Number.isNaN(year) ? null : year
  } else if (data.takenAt === null) {
    data.takenYear = null
  }
  return data
}

export const Photos: CollectionConfig = {
  slug: 'photos',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['filename', 'title', 'categories', 'location', 'takenAt', 'status'],
    group: 'Content',
    listSearchableFields: ['title', 'species', 'scientificName'],
  },
  defaultSort: '-takenAt',
  access: {
    read: publicWhenStatus('published'),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  upload: {
    mimeTypes: ['image/*'],
    focalPoint: true,
    adminThumbnail: 'thumbnail',
    imageSizes: [
      { name: 'thumbnail', width: 320, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 75 } } },
      { name: 'card', width: 800, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'large', width: 1600, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 82 } } },
      { name: 'xlarge', width: 2560, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 85 } } },
    ],
  },
  indexes: [
    { fields: ['status', 'takenAt'] },
    { fields: ['camera', 'lens'] },
  ],
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Details',
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                { name: 'species', type: 'text', admin: { description: 'Common name, e.g. Sambar deer' } },
                { name: 'scientificName', type: 'text', admin: { description: 'e.g. Rusa unicolor' } },
              ],
            },
            {
              name: 'description',
              type: 'textarea',
              admin: { description: 'Shown as "About the Photo".' },
            },
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              filterOptions: { status: { not_equals: 'archived' } },
            },
            {
              name: 'collections',
              type: 'relationship',
              relationTo: 'photo-collections',
              hasMany: true,
              filterOptions: { status: { not_equals: 'archived' } },
            },
            { name: 'location', type: 'relationship', relationTo: 'locations', index: true },
            { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
          ],
        },
        {
          label: 'Camera & settings',
          description: 'Filled automatically from the photo’s EXIF data on upload; edit if needed.',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'camera', type: 'relationship', relationTo: 'cameras', index: true },
                { name: 'lens', type: 'relationship', relationTo: 'lenses', index: true },
                { name: 'teleconverter', type: 'text', admin: { description: 'e.g. 1.4x' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'focalLengthMm', label: 'Focal length (mm)', type: 'number' },
                { name: 'aperture', label: 'Aperture (f/)', type: 'number' },
                { name: 'shutterSpeed', type: 'text', admin: { description: 'e.g. 1/1800' } },
                { name: 'iso', label: 'ISO', type: 'number' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'takenAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
                {
                  name: 'takenYear',
                  type: 'number',
                  index: true,
                  admin: { readOnly: true, description: 'Set from the date taken.' },
                },
              ],
            },
            { name: 'exifRaw', label: 'Raw EXIF', type: 'json', admin: { readOnly: true } },
          ],
        },
        {
          label: 'Extras',
          fields: [
            {
              name: 'rawImage',
              label: 'RAW version',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Second file for the Edited/RAW toggle.' },
            },
            { name: 'ambientSound', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
    slugField({ from: 'title' }),
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'published',
      index: true,
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Hidden', value: 'hidden' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [
        { label: 'Manual upload', value: 'manual' },
        { label: 'Bulk upload', value: 'bulk' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'driveFileId',
      type: 'text',
      unique: true,
      index: true,
      admin: { position: 'sidebar', readOnly: true, description: 'Google Drive file ID (bulk uploads).' },
    },
    {
      name: 'bulkRow',
      type: 'relationship',
      relationTo: 'bulk-upload-rows',
      admin: { position: 'sidebar', readOnly: true },
    },
    { name: 'placeholder', type: 'text', admin: { hidden: true } },
    { name: 'dominantColor', type: 'text', admin: { hidden: true } },
  ],
  hooks: {
    beforeChange: [fillFromFile, setTakenYear],
  },
}
