'use client'

import React from 'react'
import { ClerkProvider } from '@clerk/nextjs'

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const devBypass = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true'

  // If dev bypass or no valid key → render children without Clerk
  if (devBypass || !publishableKey || publishableKey === 'pk_test_dummy_key_for_dev' || publishableKey === '') {
    return <>{children}</>
  }

  // Provide Clerk to the client subtree
  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  )
}
