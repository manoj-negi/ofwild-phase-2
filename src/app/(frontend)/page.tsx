import Link from 'next/link'
import { getPayload } from 'payload'

import config from '@/payload.config'

export const dynamic = 'force-dynamic'

/** Placeholder home page until the Flow canvas is built (Milestone 4). */
export default async function HomePage() {
  const payload = await getPayload({ config })
  const { totalDocs } = await payload.count({ collection: 'photos', where: { status: { equals: 'published' } } })

  return (
    <div className="home">
      <h1>Of Wild &amp; Walls</h1>
      <p>Phase 2 is in development. {totalDocs} published photos.</p>
      <Link className="admin" href="/admin">
        Admin panel
      </Link>
    </div>
  )
}
