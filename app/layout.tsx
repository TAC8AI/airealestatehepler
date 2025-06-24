import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'AI Real Estate Helper - Contract Analysis, Property Valuation & Listing Generation',
    template: '%s | AI Real Estate Helper'
  },
  description: 'Professional AI-powered real estate tools for agents and brokers. Get instant contract analysis, property valuations, and generate compelling listings. Trusted by top real estate professionals.',
  keywords: [
    'AI real estate tools',
    'real estate contract analysis',
    'property valuation software',
    'MLS listing generator',
    'real estate agent tools',
    'property analysis AI',
    'real estate automation',
    'contract review software',
    'real estate technology',
    'property valuation tool',
    'listing description generator',
    'real estate AI assistant'
  ],
  authors: [{ name: 'Tucker Carlile', url: 'https://carlileadvisors.com' }],
  creator: 'AI Real Estate Helper',
  publisher: 'AI Real Estate Helper',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://airealestatehelper.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AI Real Estate Helper - Professional Tools for Real Estate Success',
    description: 'Professional AI-powered real estate tools for agents and brokers. Get instant contract analysis, property valuations, and generate compelling listings.',
    url: 'https://airealestatehelper.com',
    siteName: 'AI Real Estate Helper',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Real Estate Helper - Professional Real Estate Tools',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Real Estate Helper - Professional Real Estate Tools',
    description: 'Professional AI-powered tools for contract analysis, property valuation, and listing generation. Trusted by top real estate professionals.',
    images: ['/twitter-image.png'],
    creator: '@airealestatehelper',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  category: 'technology',
  classification: 'Real Estate Software',
  verification: {
    google: 'google-site-verification-code-here',
    yandex: 'yandex-verification-code-here',
    yahoo: 'yahoo-site-verification-code-here',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "AI Real Estate Helper",
              "description": "Professional AI-powered real estate tools for contract analysis, property valuation, and listing generation.",
              "url": "https://airealestatehelper.com",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "29",
                "priceCurrency": "USD",
                "priceValidUntil": "2025-12-31"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "127",
                "bestRating": "5"
              },
              "author": {
                "@type": "Person",
                "name": "Tucker Carlile"
              },
              "publisher": {
                "@type": "Organization",
                "name": "AI Real Estate Helper"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
