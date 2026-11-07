import type { CollectionConfig } from 'payload'

/**
 * Single admin login used by the client. No roles: anyone signed in has full access.
 * After the first account exists, only a signed-in admin can create another.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Settings',
  },
  auth: true,
  access: {
    create: async ({ req }) => {
      if (req.user) return true
      const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
      return totalDocs === 0
    },
  },
  fields: [{ name: 'name', type: 'text' }],
}
