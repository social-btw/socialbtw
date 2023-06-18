import './globals.css'
import { Inter } from 'next/font/google'

import Head from "next/head"

import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <>
    <Head>
      <title>Social BTW</title>
    </Head>
    <div align="center">
          <br/>
          <div class="personal-hiscores__table">
            <div id="col2">
              <div id="headerHiscores"></div>
              <div class="hiscoresHiddenBG">
                <div id="contentHiscores">
                  {children}
                </div>
              </div>
              <div id="footerHiscores"></div>
            </div>
          </div>
        </div>
        <Analytics />
    </>
  )
}
