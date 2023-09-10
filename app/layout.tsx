import './globals.css'
import type { Metadata } from 'next'
import styles from '@/styles/hiscores.module.css'
import { runescapeChat07 } from './fonts/fonts'

import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'Social BTW',
  description: 'Official website of Social BTW OSRS clan',
  openGraph: {
    title: 'Social BTW',
    description: 'Official website of Social BTW OSRS clan',
    url: 'https://www.socialbtw.com',
    images: [
      {
        url: 'https://www.socialbtw.com/gnome.png',
        width: 400,
        height: 400,
      },
    ],
    locale: 'en_CA',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <main className={runescapeChat07.className}>
          <div className={styles.hiscoresHeader} />
          <div className={styles.hiscoresContent}>
            {children}
          </div>
          <div className={styles.hiscoresFooter} />
        </main>
      </body>
      <Analytics />
    </html>
  )
}
