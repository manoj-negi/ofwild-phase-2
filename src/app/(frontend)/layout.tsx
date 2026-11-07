import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Wildlife and heritage photography by Of Wild & Walls.',
  title: 'Of Wild & Walls',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
