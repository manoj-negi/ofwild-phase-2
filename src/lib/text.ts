/**
 * Turn any label into a URL-safe slug: "Big Cats & Co." -> "big-cats-co"
 */
export const slugify = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Key used to match spelling variants of the same thing.
 * "Nikon Z 8", "NIKON Z8" and " nikon  z8 " all become "nikonz8".
 */
export const matchKey = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

/**
 * Extract the file ID from the common Google Drive link formats:
 *   https://drive.google.com/file/d/<id>/view
 *   https://drive.google.com/open?id=<id>
 *   https://drive.google.com/uc?id=<id>&export=download
 */
export const parseDriveFileId = (url: string): string | null => {
  const trimmed = url.trim()
  const byPath = trimmed.match(/\/d\/([\w-]{10,})/)
  if (byPath) return byPath[1]
  const byQuery = trimmed.match(/[?&]id=([\w-]{10,})/)
  if (byQuery) return byQuery[1]
  return null
}
