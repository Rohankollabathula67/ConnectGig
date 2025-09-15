'use client'

import { useAuthWithBypass } from '@/lib/auth-utils'
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
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuthWithBypass()
  
  console.log('HomePage: isSignedIn:', isSignedIn, 'isLoaded:', isLoaded)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 text-sm">
              🚀 AI-Powered Platform
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Connect with{' '}
              <span className="text-primary bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Skilled Gig Workers
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Get on-demand skilled services faster with AI-powered matching, 
              fair pricing, and trusted professionals in your area.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {isLoaded && (
                <>
                  {isSignedIn ? (
                    <Link href="/dashboard">
                      <Button size="lg" className="btn-primary text-lg px-8 py-3">
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/sign-up">
                        <Button size="lg" className="btn-primary text-lg px-8 py-3">
                          Get Started
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link href="/sign-in">
                        <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                          Sign In
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 hidden lg:block">
          <div className="w-20 h-20 bg-primary/10 rounded-full animate-pulse"></div>
        </div>
        <div className="absolute top-40 right-20 hidden lg:block">
          <div className="w-16 h-16 bg-blue-200 rounded-full animate-pulse delay-1000"></div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Role
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you need services or want to provide them, 
              ConnectGig has you covered
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Client Card */}
            <Card className="card-hover border-2 hover:border-primary/20">
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
                    <span>AI-powered worker matching</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span>Local professionals nearby</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <span>Verified & rated workers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <span>Quick response times</span>
                  </div>
                </div>
                {isLoaded && (
                  <>
                    {isSignedIn ? (
                      <Link href="/dashboard">
                        <Button className="w-full btn-primary" size="lg">
                          Go to Dashboard
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/sign-up">
                        <Button className="w-full btn-primary" size="lg">
                          Find Workers
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Worker Card */}
            <Card className="card-hover border-2 hover:border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">I Provide Services</CardTitle>
                <CardDescription className="text-lg">
                  Join our network of skilled professionals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span>Earn more with fair pricing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>Build your client base</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <span>Grow your reputation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <span>Secure payments & support</span>
                  </div>
                </div>
                {isLoaded && (
                  <>
                    {isSignedIn ? (
                      <Link href="/dashboard">
                        <Button className="w-full btn-primary" size="lg">
                          Go to Dashboard
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/sign-up">
                        <Button className="w-full btn-primary" size="lg">
                          Join as Worker
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ConnectGig?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI-first approach delivers better matches, fairer pricing, and trusted connections
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Matching</h3>
              <p className="text-gray-600">
                Intelligent algorithms match you with the best workers based on skills, location, and availability
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Pricing</h3>
              <p className="text-gray-600">
                AI suggests fair pricing based on market data, ensuring both clients and workers get value
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trust & Safety</h3>
              <p className="text-gray-600">
                Verified profiles, secure payments, and AI-powered content moderation for a safe experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied clients and skilled workers who trust ConnectGig
          </p>
          {isLoaded && (
            <>
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/sign-up">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
