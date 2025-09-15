'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs'

export function Navigation() {
  const { isLoaded, isSignedIn } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">ConnectGig</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/jobs">Jobs</Link>
            <Link href="/workers">Workers</Link>

            {isLoaded ? (
              isSignedIn ? (
                <UserButton />
              ) : (
                <>
                  <SignInButton mode="modal">
                    <button className="btn">Sign in</button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="btn-outline">Sign up</button>
                  </SignUpButton>
                </>
              )
            ) : (
              <div className="w-24 h-6 bg-gray-100 rounded animate-pulse" />
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(v => !v)}>
              ☰
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-2">
            <Link href="/jobs" className="block py-1">Jobs</Link>
            <Link href="/workers" className="block py-1">Workers</Link>
            {isLoaded && !isSignedIn && (
              <div className="flex space-x-2 mt-2">
                <SignInButton mode="modal"><button className="btn">Sign in</button></SignInButton>
                <SignUpButton mode="modal"><button className="btn-outline">Sign up</button></SignUpButton>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
