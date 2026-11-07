import type { CollectionConfig } from 'payload'

import { anyone, isAdmin } from '@/access'
import { slugField } from '@/fields/slug'
import { taxonomyStatusField } from '@/fields/status'

/**
 * Where a photo was taken. `name` is what the site shows.
 * place / state / country are optional structured parts, kept so the
 * "Country > State > Place" option stays open without a schema change.
 */
export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'country', 'status'],
    group: 'Taxonomy',
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
      admin: { description: 'As shown on the site, e.g. Ranthambore, Rajasthan, India' },
    },
    slugField(),
    {
      type: 'row',
      fields: [
        { name: 'place', type: 'text' },
        { name: 'state', type: 'text' },
        { name: 'country', type: 'text' },
      ],
    },
    taxonomyStatusField(['active', 'archived']),
  ],
}
