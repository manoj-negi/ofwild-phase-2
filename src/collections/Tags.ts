import type { CollectionConfig } from 'payload'

import { anyone, isAdmin } from '@/access'
import { slugField } from '@/fields/slug'

/**
 * Free-form tags (monsoon, sunrise, pair). Searchable, but not a visitor filter.
 * The unique slug stops "Monsoon" and "monsoon" becoming two tags.
 */
export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    group: 'Taxonomy',
  },
  defaultSort: 'name',
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [{ name: 'name', type: 'text', required: true }, slugField()],
}
