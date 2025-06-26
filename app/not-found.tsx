import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found - AI Real Estate Helper',
  description: 'The page you\'re looking for doesn\'t exist. Explore our AI-powered real estate tools for contract analysis, property valuation, and listing generation.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mx-auto mb-4">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <path d="M8 14 L16 8 L24 14 L24 23 L8 23 Z" fill="#ffffff"/>
              <circle cx="12" cy="12" r="1.5" fill="#4ade80"/>
              <circle cx="20" cy="12" r="1.5" fill="#3b82f6"/>
              <circle cx="16" cy="10" r="1.5" fill="#8b5cf6"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI Real Estate Helper</h1>
        </div>

        {/* 404 Message */}
        <div className="mb-8">
          <h2 className="text-6xl font-bold text-gray-900 mb-4">404</h2>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Page Not Found</h3>
          <p className="text-gray-600">
            Looks like this property listing has been sold! But don't worry, we have plenty of AI-powered tools to help you find success.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-8">
          <Link
            href="/dashboard"
            className="block w-full bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="block w-full border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-gray-400 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        {/* Quick Links */}
        <div className="text-sm text-gray-500">
          <p className="mb-4">Or explore our popular tools:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Link href="/dashboard/contract-analysis" className="hover:text-gray-700 transition-colors">
              Contract Analysis
            </Link>
            <Link href="/dashboard/property-valuation" className="hover:text-gray-700 transition-colors">
              Property Valuation
            </Link>
            <Link href="/dashboard/generate-listing" className="hover:text-gray-700 transition-colors">
              Generate Listing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 