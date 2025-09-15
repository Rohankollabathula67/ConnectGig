'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import type { UserResource } from '@clerk/types'

interface AuthState {
  isSignedIn: boolean
  isLoaded: boolean
  user: UserResource | null
}

export function useAuthWithBypass(): AuthState {
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()
  
  return {
    isSignedIn: isSignedIn ?? false,
    isLoaded: isLoaded ?? true,
    user: user ?? null
  }
}
