import type { Access, Where } from 'payload'

/** Only the signed-in admin. */
export const isAdmin: Access = ({ req }) => Boolean(req.user)

/** Anyone. */
export const anyone: Access = () => true

/** Nobody — used to turn deletes into archiving. */
export const nobody: Access = () => false

/**
 * Public visitors only see rows whose `status` is in `visible`; the admin sees everything.
 */
export const publicWhenStatus =
  (...visible: string[]): Access =>
  ({ req }) => {
    if (req.user) return true
    const where: Where = { status: { in: visible } }
    return where
  }
