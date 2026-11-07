import type { NumberField, SelectField } from 'payload'

/**
 * Visibility of a taxonomy entry (category, collection).
 * - active:   shown on the site and in filters
 * - hidden:   kept, but not shown on the site
 * - archived: replaces delete; photos keep their links
 */
export const taxonomyStatusField = (options: ('active' | 'hidden' | 'archived')[] = ['active', 'hidden', 'archived']): SelectField => ({
  name: 'status',
  type: 'select',
  required: true,
  defaultValue: 'active',
  index: true,
  options: options.map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  })),
  admin: {
    position: 'sidebar',
    description: 'Hidden and archived entries are not shown on the site. Archive instead of deleting.',
  },
})

export const sortOrderField: NumberField = {
  name: 'sortOrder',
  type: 'number',
  admin: {
    position: 'sidebar',
    description: 'Lower numbers come first in the filter list.',
  },
}
