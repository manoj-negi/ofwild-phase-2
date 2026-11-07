import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access'

/**
 * One bulk upload: a set of rows the admin fills in on the Bulk Upload page.
 * Stays a draft until Upload is clicked; counts drive the progress bar.
 */
export const BulkUploadBatches: CollectionConfig = {
  slug: 'bulk-upload-batches',
  labels: { singular: 'Bulk upload', plural: 'Bulk uploads' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'totalRows', 'doneRows', 'failedRows', 'createdAt'],
    group: 'Bulk upload',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', admin: { description: 'Optional label, e.g. Ranthambore trip' } },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Processing', value: 'processing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Completed with errors', value: 'completed_with_errors' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'totalRows', type: 'number', defaultValue: 0, admin: { readOnly: true } },
        { name: 'doneRows', type: 'number', defaultValue: 0, admin: { readOnly: true } },
        { name: 'failedRows', type: 'number', defaultValue: 0, admin: { readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'startedAt', type: 'date', admin: { readOnly: true } },
        { name: 'finishedAt', type: 'date', admin: { readOnly: true } },
      ],
    },
    {
      name: 'rows',
      type: 'join',
      collection: 'bulk-upload-rows',
      on: 'batch',
      defaultSort: 'rowIndex',
    },
  ],
}
