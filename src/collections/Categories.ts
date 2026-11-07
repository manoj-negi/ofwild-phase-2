import type { CollectionConfig } from 'payload'

import { isAdmin, nobody, publicWhenStatus } from '@/access'
import { slugField } from '@/fields/slug'
import { sortOrderField, taxonomyStatusField } from '@/fields/status'

/**
 * Nested categories, e.g. Wildlife > Big Cats > Tigers.
 * `parent` and `breadcrumbs` are added by @payloadcms/plugin-nested-docs (see payload.config.ts).
 * `path` is the slug chain ("wildlife/big-cats/tigers") used for filter links and for
 * matching a category together with all its sub-categories.
 */
export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Category', plural: 'Categories' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'path', 'status', 'sortOrder'],
    group: 'Taxonomy',
    description: 'Archive a category instead of deleting it; its photos keep their links.',
  },
  defaultSort: 'path',
  access: {
    read: publicWhenStatus('active'),
    create: isAdmin,
    update: isAdmin,
    delete: nobody,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField({ unique: false }),
    {
      name: 'path',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Set automatically from the parent chain.',
      },
    },
    {
      name: 'depth',
      type: 'number',
      admin: { readOnly: true, position: 'sidebar' },
    },
    taxonomyStatusField(),
    sortOrderField,
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        const slug: string | undefined = data.slug ?? originalDoc?.slug
        const parentRef = data.parent !== undefined ? data.parent : originalDoc?.parent
        const parentId = typeof parentRef === 'object' && parentRef !== null ? parentRef.id : parentRef

        if (!slug) return data

        if (!parentId) {
          data.path = slug
          data.depth = 0
          return data
        }

        const parent = await req.payload.findByID({
          collection: 'categories',
          id: parentId,
          depth: 0,
          req,
          overrideAccess: true,
        })
        data.path = `${parent.path ?? parent.slug}/${slug}`
        data.depth = (parent.depth ?? 0) + 1
        return data
      },
    ],
  },
}
