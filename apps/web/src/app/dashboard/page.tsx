'use client'

import { useAuthWithBypass } from '@/lib/auth-utils'

// Disable static generation for this page
export const dynamic = 'force-dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
  UserCheck, 
  MapPin, 
  Clock, 
  Star, 
  Shield, 
  Zap,
  ArrowRight,
  Users,
  TrendingUp,
  Plus,
  Search,
  MessageSquare,
  Bell,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function DashboardPage() {
  const { isSignedIn, isLoaded, user } = useAuthWithBypass()
  const [selectedRole, setSelectedRole] = useState<'client' | 'worker' | null>(null)

  // If not loaded or not signed in, show loading or redirect
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your dashboard.</p>
          <Link href="/sign-in">
            <Button className="btn-primary">Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Role selection if not set yet
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Welcome to ConnectGig, {user?.firstName || 'User'}!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose your role to get started with your personalized dashboard
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Client Role */}
            <Card 
              className="card-hover border-2 hover:border-primary/20 cursor-pointer"
              onClick={() => setSelectedRole('client')}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">I Need Services</CardTitle>
                <CardDescription className="text-lg">
                  Find skilled professionals for your projects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-green-600" />
                    <span>Post job requests</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Search className="h-5 w-5 text-blue-600" />
                    <span>Find qualified workers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    <span>Manage communications</span>
                  </div>
                </div>
                <Button className="w-full btn-primary" size="lg">
                  Continue as Client
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Worker Role */}
            <Card 
              className="card-hover border-2 hover:border-primary/20 cursor-pointer"
              onClick={() => setSelectedRole('worker')}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">I Provide Services</CardTitle>
                <CardDescription className="text-lg">
                  Manage your gigs and client relationships
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span>Find job opportunities</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>Manage your clients</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <span>Build your reputation</span>
                  </div>
                </div>
                <Button className="w-full btn-primary" size="lg">
                  Continue as Worker
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Main dashboard content based on selected role
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedRole === 'client' ? 'Client Dashboard' : 'Worker Dashboard'}
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.firstName || 'User'}! Here's what's happening today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {selectedRole === 'client' ? (
                    <>
                      <Button className="w-full btn-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Post a New Job
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Search className="h-4 w-4 mr-2" />
                        Find Workers
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="w-full btn-primary">
                        <Search className="h-4 w-4 mr-2" />
                        Browse Jobs
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Briefcase className="h-4 w-4 mr-2" />
                        My Gigs
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest interactions and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      {selectedRole === 'client' 
                        ? 'New worker application received for "Website Development"'
                        : 'New job posted: "Mobile App Development"'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      {selectedRole === 'client'
                        ? 'Payment completed for "Logo Design" project'
                        : 'Payment received for "Logo Design" project'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-primary">
                      {user?.firstName?.[0] || 'U'}
                    </span>
                  </div>
                  <h3 className="font-semibold">{user?.fullName || 'User'}</h3>
                  <p className="text-sm text-gray-600">{user?.emailAddresses[0]?.emailAddress}</p>
                  <Badge variant="secondary" className="mt-2">
                    {selectedRole === 'client' ? 'Client' : 'Worker'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {selectedRole === 'client' ? 'Active Jobs' : 'Active Gigs'}
                  </span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">4.8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
