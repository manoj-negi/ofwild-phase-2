import type { CollectionConfig } from 'payload'

import { anyone, isAdmin } from '@/access'
import { slugField } from '@/fields/slug'
import { matchKey } from '@/lib/text'

/**
 * Cameras and lenses share one shape. EXIF strings are matched to a row through
 * `exifAliases`, compared case- and space-insensitively via the hidden `matchKeys`,
 * so "NIKON Z 8" and "Nikon Z8" land on the same camera.
 */
const gearCollection = (slug: 'cameras' | 'lenses', singular: string, plural: string, example: string): CollectionConfig => ({
  slug,
  labels: { singular, plural },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'make', 'needsReview'],
    group: 'Gear',
    description: `Entries created automatically from EXIF are marked "Needs review"; give them a clean name and merge spelling variants into Exif aliases.`,
  },
  defaultSort: 'name',
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: `Clean display name, e.g. ${example}` },
    },
    slugField(),
    { name: 'make', type: 'text' },
    {
      name: 'exifAliases',
      type: 'text',
      hasMany: true,
      admin: {
        description: 'Raw EXIF strings that should map to this entry (case and spaces are ignored).',
      },
    },
    {
      name: 'matchKeys',
      type: 'text',
      hasMany: true,
      index: true,
      admin: { hidden: true },
    },
    {
      name: 'needsReview',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        const sources = [data.name, ...(data.exifAliases ?? [])].filter(
          (value): value is string => typeof value === 'string' && value.trim().length > 0,
        )
        data.matchKeys = Array.from(new Set(sources.map(matchKey).filter(Boolean)))
        return data
      },
    ],
  },
})

export const Cameras = gearCollection('cameras', 'Camera', 'Cameras', 'Fujifilm X-H2S')
export const Lenses = gearCollection('lenses', 'Lens', 'Lenses', 'Fujifilm XF 100-400mm')
