import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'AI Real Estate Helper - Close More Deals with AI-Powered Tools',
    template: '%s | AI Real Estate Helper'
  },
  description: 'Revolutionary AI real estate tools trusted by 1000+ agents. Get instant contract analysis, property valuations and viral-worthy listings. Save 10+ hours weekly. Free trial!',
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
    'real estate AI assistant',
    'close more deals',
    'real estate productivity',
    'agent success tools',
    'property marketing AI',
    'real estate lead generation',
    'commission maximization'
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
    title: 'AI Real Estate Helper - Close More Deals with AI',
    description: 'Revolutionary AI tools trusted by 1000+ agents. Get instant contract analysis, property valuations and viral-worthy listings. Save 10+ hours weekly!',
    url: 'https://airealestatehelper.com',
    siteName: 'AI Real Estate Helper',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'AI Real Estate Helper - Revolutionary AI Tools for Real Estate Success',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Real Estate Helper - Close More Deals with AI',
    description: 'Revolutionary AI tools trusted by 1000+ agents. Instant contract analysis, valuations and viral listings. Save 10+ hours weekly! Free trial available.',
    images: ['/og-image.svg'],
    creator: '@airealestatehelper',
    site: '@airealestatehelper',
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
      { url: '/favicon.svg', type: 'image/svg+xml' },
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
        
        {/* Additional viral-friendly meta tags */}
        <meta property="og:video" content="https://airealestatehelper.com/demo-video.mp4" />
        <meta property="article:author" content="Tucker Carlile" />
        <meta property="article:section" content="Real Estate Technology" />
        <meta property="og:see_also" content="https://carlileadvisors.com" />
        <meta name="twitter:label1" content="Free Trial" />
        <meta name="twitter:data1" content="Available Now" />
        <meta name="twitter:label2" content="Users" />
        <meta name="twitter:data2" content="1000+ Agents" />
        
        {/* Theme and app-like experience */}
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="color-scheme" content="light dark" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AI RE Helper" />
        
        {/* Performance and indexing */}
        <link rel="preload" href="/favicon.svg" as="image" type="image/svg+xml" />
        <link rel="prefetch" href="/dashboard" />
        <meta name="referrer" content="origin-when-cross-origin" />
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "AI Real Estate Helper",
              "description": "Revolutionary AI-powered real estate tools that help agents close more deals. Get instant contract analysis, property valuations, and viral-worthy listings. Trusted by 1000+ real estate professionals.",
              "url": "https://airealestatehelper.com",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "offers": [
                {
                  "@type": "Offer",
                  "name": "Free Trial",
                  "price": "0",
                  "priceCurrency": "USD",
                  "priceValidUntil": "2025-12-31",
                  "description": "Free trial with 1 contract analysis per month"
                },
                {
                  "@type": "Offer",
                  "name": "Professional Plan",
                  "price": "29",
                  "priceCurrency": "USD",
                  "priceValidUntil": "2025-12-31",
                  "description": "Unlimited access to all AI real estate tools"
                }
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "1247",
                "bestRating": "5"
              },
              "author": {
                "@type": "Person",
                "name": "Tucker Carlile",
                "url": "https://carlileadvisors.com"
              },
              "publisher": {
                "@type": "Organization",
                "name": "AI Real Estate Helper",
                "url": "https://airealestatehelper.com"
              },
              "features": [
                "AI Contract Analysis",
                "Property Valuation",
                "Listing Generation",
                "Market Insights",
                "Risk Assessment"
              ],
              "screenshot": "https://airealestatehelper.com/og-image.svg"
            })
          }}
        />

        {/* Google Analytics 4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-98DNCZS0NN"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-98DNCZS0NN', {
                page_title: document.title,
                page_location: window.location.href,
                custom_map: {
                  'custom_parameter_1': 'content_group1',
                  'custom_parameter_2': 'content_group2', 
                  'custom_parameter_3': 'content_group3'
                }
              });
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
