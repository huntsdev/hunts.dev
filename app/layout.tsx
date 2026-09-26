// used for rendering equations (optional)
import 'katex/dist/katex.min.css'
// used for code syntax highlighting (optional)
import 'prismjs/themes/prism-coy.css'
// core styles shared by all of react-notion-x (required)
import 'react-notion-x/styles.css'
// global styles shared across the entire site
import '@/styles/global.css'
// global style overrides for notion
import '@/styles/notion.css'
// global style overrides for prism theme (optional)
import '@/styles/prism-theme.css'

import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import * as config from '@/lib/config'

import { Providers } from './providers'

export const metadata: Metadata = {
  metadataBase: new URL(config.host),
  title: config.name,
  description: config.description,
  manifest: '/manifest.json',
  icons: {
    shortcut: '/favicon-32x32.png',
    icon: [
      {
        url: '/favicon-32x32.png',
        type: 'image/png',
        sizes: '32x32'
      },
      {
        url: '/favicon-128x128.png',
        type: 'image/png',
        sizes: '128x128'
      },
      {
        url: '/favicon-192x192.png',
        type: 'image/png',
        sizes: '192x192'
      },
      {
        url: '/favicon-512x512.png',
        type: 'image/png',
        sizes: '512x512'
      }
    ],
    apple: '/favicon-192x192.png'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black'
  },
  alternates: {
    types: {
      'application/rss+xml': [
        {
          url: '/feed',
          title: config.name
        }
      ]
    }
  },
  openGraph: {
    type: 'website',
    siteName: config.name,
    title: config.name,
    description: config.description
  },
  twitter: {
    card: 'summary',
    creator: config.twitter ? `@${config.twitter}` : undefined,
    title: config.name,
    description: config.description
  },
  other: {
    'mobile-web-app-capable': 'yes'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    {
      media: '(prefers-color-scheme: light)',
      color: '#fefffe'
    },
    {
      media: '(prefers-color-scheme: dark)',
      color: '#111216'
    }
  ]
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
