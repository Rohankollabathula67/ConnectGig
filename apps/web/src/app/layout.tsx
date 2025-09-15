import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProviderWrapper } from '@/components/providers/ClerkProviderWrapper'
import { Navigation } from '@/components/layout/Navigation'

// Disable static generation for the entire app due to Clerk hooks
export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ConnectGig - AI-powered Gig Worker Platform',
  description: 'Connect with skilled gig workers for on-demand services. Faster hiring, fair pricing, and trust through modern AI.',
  keywords: 'gig workers, on-demand services, AI matching, local services, skilled professionals',
  authors: [{ name: 'ConnectGig Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'ConnectGig - AI-powered Gig Worker Platform',
    description: 'Connect with skilled gig workers for on-demand services',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ConnectGig - AI-powered Gig Worker Platform',
    description: 'Connect with skilled gig workers for on-demand services',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProviderWrapper>
          <Navigation />
          {children}
        </ClerkProviderWrapper>
      </body>
    </html>
  )
}

