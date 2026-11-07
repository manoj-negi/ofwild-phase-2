import type { CollectionConfig } from 'payload'

import { isAdmin, nobody, publicWhenStatus } from '@/access'
import { slugField } from '@/fields/slug'
import { sortOrderField, taxonomyStatusField } from '@/fields/status'

/**
 * The client's "Collections" (a trip, a series or a story), e.g. "Ranthambore 2026".
 * Named photo-collections in code because "collection" is also Payload's word for a table.
 */
export const PhotoCollections: CollectionConfig = {
  slug: 'photo-collections',
  labels: { singular: 'Collection', plural: 'Collections' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'status', 'sortOrder'],
    group: 'Taxonomy',
    description: 'Archive a collection instead of deleting it; its photos keep their links.',
  },
  defaultSort: 'sortOrder',
  access: {
    read: publicWhenStatus('active'),
    create: isAdmin,
    update: isAdmin,
    delete: nobody,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField(),
    {
      name: 'code',
      type: 'text',
      admin: {
        description: 'Prefix for the collection index shown on each photo, e.g. "HR" gives HR.01/05.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Shown as "About the Collection" in the photo details.' },
    },
    {
      name: 'cover',
      type: 'relationship',
      relationTo: 'photos',
    },
    taxonomyStatusField(),
    sortOrderField,
  ],
}
