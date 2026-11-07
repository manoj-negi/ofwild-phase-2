import type { CollectionSlug, TextField } from 'payload'

import { slugify } from '@/lib/text'

type SlugFieldOptions = {
  /** Field the slug is generated from when left empty. */
  from?: string
  unique?: boolean
}

/**
 * Slug generated from another field (default: `name`) when the editor leaves it empty.
 * Editors can still type their own slug; it is normalised either way.
 * When the slug must be unique, a clash gets a numeric suffix: golden-reflection-2.
 */
export const slugField = ({ from = 'name', unique = true }: SlugFieldOptions = {}): TextField => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique,
  required: true,
  admin: {
    position: 'sidebar',
    description: `Used in URLs and filter links. Generated from ${from} if left empty.`,
  },
  hooks: {
    beforeValidate: [
      async ({ value, data, req, collection, originalDoc }) => {
        const source = typeof value === 'string' && value.trim() ? value : data?.[from]
        if (typeof source !== 'string') return value

        const base = slugify(source)
        if (!unique || !collection || !base) return base

        const taken = await req.payload.find({
          collection: collection.slug as CollectionSlug,
          where: {
            and: [
              { slug: { like: base } },
              ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
            ],
          },
          select: { slug: true },
          limit: 1000,
          depth: 0,
          pagination: false,
          req,
          overrideAccess: true,
        })
        const used = new Set(taken.docs.map((doc) => (doc as { slug?: string }).slug))
        if (!used.has(base)) return base

        let n = 2
        while (used.has(`${base}-${n}`)) n += 1
        return `${base}-${n}`
      },
    ],
  },
})
