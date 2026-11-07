import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access'
import { parseDriveFileId } from '@/lib/text'

/**
 * One row of a bulk upload = one photo to create from a Google Drive link.
 * Categories, collections, location and tags point at the same tables as photos,
 * so only values that already exist in the admin can be chosen.
 *
 * Status, in order: draft -> invalid | ready -> queued -> downloading -> processing -> done.
 * A row can also end as failed (retry puts it back to queued) or duplicate.
 */
export const BulkUploadRows: CollectionConfig = {
  slug: 'bulk-upload-rows',
  labels: { singular: 'Bulk upload row', plural: 'Bulk upload rows' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['rowIndex', 'title', 'driveUrl', 'status', 'error'],
    group: 'Bulk upload',
  },
  defaultSort: 'rowIndex',
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  indexes: [{ fields: ['batch', 'rowIndex'] }],
  fields: [
    { name: 'batch', type: 'relationship', relationTo: 'bulk-upload-batches', required: true, index: true },
    { name: 'rowIndex', type: 'number', required: true },
    { name: 'driveUrl', label: 'Google Drive link', type: 'text', required: true },
    {
      name: 'driveFileId',
      type: 'text',
      index: true,
      admin: { readOnly: true, description: 'Parsed from the link; used for the duplicate check.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'driveFileName', type: 'text', admin: { readOnly: true } },
        { name: 'driveMimeType', type: 'text', admin: { readOnly: true } },
        { name: 'driveSizeBytes', type: 'number', admin: { readOnly: true } },
      ],
    },
    { name: 'title', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'species', type: 'text' },
        { name: 'scientificName', type: 'text' },
      ],
    },
    { name: 'description', type: 'textarea' },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      filterOptions: { status: { not_equals: 'archived' } },
    },
    {
      name: 'collections',
      type: 'relationship',
      relationTo: 'photo-collections',
      hasMany: true,
      filterOptions: { status: { not_equals: 'archived' } },
    },
    { name: 'location', type: 'relationship', relationTo: 'locations' },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Invalid', value: 'invalid' },
        { label: 'Ready', value: 'ready' },
        { label: 'Queued', value: 'queued' },
        { label: 'Downloading', value: 'downloading' },
        { label: 'Processing', value: 'processing' },
        { label: 'Done', value: 'done' },
        { label: 'Failed', value: 'failed' },
        { label: 'Duplicate', value: 'duplicate' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'error', type: 'text', admin: { position: 'sidebar', readOnly: true } },
    { name: 'attempts', type: 'number', defaultValue: 0, admin: { position: 'sidebar', readOnly: true } },
    {
      name: 'photo',
      type: 'relationship',
      relationTo: 'photos',
      admin: { position: 'sidebar', readOnly: true, description: 'Set when the photo is created.' },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (typeof data.driveUrl === 'string') {
          data.driveFileId = parseDriveFileId(data.driveUrl)
        }
        return data
      },
    ],
  },
}
