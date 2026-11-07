import type { CollectionConfig } from 'payload'

import { anyone, isAdmin } from '@/access'

/** Secondary files: RAW versions for the Edited/RAW toggle, ambient audio, other admin uploads. */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'kind', 'mimeType'],
    group: 'Content',
  },
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  upload: {
    mimeTypes: ['image/*', 'audio/*'],
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'raw',
      options: [
        { label: 'RAW version', value: 'raw' },
        { label: 'Ambient audio', value: 'audio' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'alt', type: 'text' },
  ],
}
