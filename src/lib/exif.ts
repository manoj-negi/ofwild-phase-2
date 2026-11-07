import exifr from 'exifr'
import type { PayloadRequest } from 'payload'
import sharp from 'sharp'

import { matchKey, slugify } from './text'

export type PhotoExif = {
  cameraName?: string
  cameraMake?: string
  lensName?: string
  lensMake?: string
  aperture?: number
  shutterSpeed?: string
  iso?: number
  focalLengthMm?: number
  takenAt?: string
  raw?: Record<string, unknown>
}

const EXIF_TAGS = [
  'Make',
  'Model',
  'LensMake',
  'LensModel',
  'FNumber',
  'ExposureTime',
  'ISO',
  'FocalLength',
  'DateTimeOriginal',
  'CreateDate',
  'OffsetTimeOriginal',
  'Software',
  'Artist',
  'Copyright',
]

/** 0.000555 -> "1/1800", 2 -> "2s" */
export const formatShutterSpeed = (seconds: number): string => {
  if (seconds >= 1) return `${Number(seconds.toFixed(1))}s`
  return `1/${Math.round(1 / seconds)}`
}

/** "FUJIFILM" + "X-H2S" -> "FUJIFILM X-H2S"; "Canon" + "Canon EOS R5" -> "Canon EOS R5" */
const joinMakeModel = (make?: string, model?: string): string | undefined => {
  const m = make?.trim()
  const n = model?.trim()
  if (!n) return m || undefined
  if (!m) return n
  return n.toLowerCase().startsWith(m.toLowerCase().split(' ')[0]) ? n : `${m} ${n}`
}

const toJsonSafe = (value: unknown): unknown => {
  if (value instanceof Date) return value.toISOString()
  if (value instanceof Uint8Array) return undefined
  if (Array.isArray(value)) return value.map(toJsonSafe)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toJsonSafe(v)]))
  }
  return value
}

/** Read the EXIF fields the site uses. Never throws: a photo without EXIF just gets nothing. */
export const readPhotoExif = async (buffer: Buffer): Promise<PhotoExif> => {
  try {
    const tags = await exifr.parse(buffer, { pick: EXIF_TAGS })
    if (!tags) return {}

    const taken: unknown = tags.DateTimeOriginal ?? tags.CreateDate
    return {
      cameraName: joinMakeModel(tags.Make, tags.Model),
      cameraMake: tags.Make?.trim(),
      lensName: tags.LensModel?.trim() || undefined,
      lensMake: tags.LensMake?.trim() || undefined,
      aperture: typeof tags.FNumber === 'number' ? tags.FNumber : undefined,
      shutterSpeed: typeof tags.ExposureTime === 'number' ? formatShutterSpeed(tags.ExposureTime) : undefined,
      iso: typeof tags.ISO === 'number' ? tags.ISO : undefined,
      focalLengthMm: typeof tags.FocalLength === 'number' ? Math.round(tags.FocalLength) : undefined,
      takenAt: taken instanceof Date && !Number.isNaN(taken.getTime()) ? taken.toISOString() : undefined,
      raw: toJsonSafe(tags) as Record<string, unknown>,
    }
  } catch {
    return {}
  }
}

/** Tiny blurred preview + dominant colour, shown while canvas tiles load. */
export const makePlaceholder = async (buffer: Buffer): Promise<{ placeholder?: string; dominantColor?: string }> => {
  try {
    const image = sharp(buffer).rotate()
    const [tiny, stats] = await Promise.all([
      image.clone().resize(16, 16, { fit: 'inside' }).webp({ quality: 40 }).toBuffer(),
      image.clone().stats(),
    ])
    const { r, g, b } = stats.dominant
    const hex = (n: number) => n.toString(16).padStart(2, '0')
    return {
      placeholder: `data:image/webp;base64,${tiny.toString('base64')}`,
      dominantColor: `#${hex(r)}${hex(g)}${hex(b)}`,
    }
  } catch {
    return {}
  }
}

/**
 * Find the camera/lens whose name or aliases match the raw EXIF string, or create one
 * marked "needs review" so the admin can clean the name later.
 */
export const findOrCreateGear = async (
  req: PayloadRequest,
  collection: 'cameras' | 'lenses',
  rawName: string,
  make?: string,
): Promise<number | string | undefined> => {
  const key = matchKey(rawName)
  if (!key) return undefined

  const existing = await req.payload.find({
    collection,
    where: { matchKeys: { in: [key] } },
    limit: 1,
    depth: 0,
    req,
    overrideAccess: true,
  })
  if (existing.docs[0]) return existing.docs[0].id

  const data = {
    name: rawName.trim(),
    slug: slugify(rawName),
    make,
    exifAliases: [rawName.trim()],
    needsReview: true,
  }
  // Separate calls keep Payload's per-collection types happy.
  const created =
    collection === 'cameras'
      ? await req.payload.create({ collection: 'cameras', data, req, overrideAccess: true })
      : await req.payload.create({ collection: 'lenses', data, req, overrideAccess: true })
  return created.id
}
