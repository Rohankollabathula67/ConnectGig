'use client'

import { useAuthWithBypass } from '@/lib/auth-utils'

// Disable static generation for this page
export const dynamic = 'force-dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Briefcase, 
  UserCheck, 
  MapPin, 
  Star, 
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Globe,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

type OnboardingStep = 'role' | 'profile' | 'skills' | 'location' | 'completion'

interface UserProfile {
  role: 'client' | 'worker' | null
  firstName: string
  lastName: string
  bio: string
  skills: string[]
  location: string
  availability: string
  hourlyRate?: string
  experience: string
  portfolio?: string
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function OnboardingPage() {
  const { isSignedIn, isLoaded, user } = useAuthWithBypass()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('role')
  const [profile, setProfile] = useState<UserProfile>({
    role: null,
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: '',
    skills: [],
    location: '',
    availability: '',
    hourlyRate: '',
    experience: '',
    portfolio: ''
  })

  // If not loaded or not signed in, show loading or redirect
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading onboarding...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to complete your profile.</p>
          <Link href="/sign-in">
            <Button className="btn-primary">Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleRoleSelection = (role: 'client' | 'worker') => {
    setProfile(prev => ({ ...prev, role }))
    setCurrentStep('profile')
  }

  const handleProfileUpdate = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleSkillsUpdate = (skill: string) => {
    if (profile.skills.includes(skill)) {
      setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))
    } else {
      setProfile(prev => ({ ...prev, skills: [...prev.skills, skill] }))
    }
  }

  const nextStep = async () => {
    const steps: OnboardingStep[] = ['role', 'profile', 'skills', 'location', 'completion']
    const currentIndex = steps.indexOf(currentStep)

    // On finishing location step, persist to API (for worker role)
    if (steps[currentIndex] === 'location' && profile.role === 'worker') {
      try {
        const token = await (window as any).Clerk?.session?.getToken?.()
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`

        const payload = {
          bio: profile.bio || `${profile.firstName} ${profile.lastName}`,
          hourlyRate: Number(profile.hourlyRate || 0),
          availability: 'AVAILABLE',
          address: profile.location || '',
          city: profile.location || '',
          state: '',
          country: '',
          latitude: 0,
          longitude: 0,
        }

        const res = await fetch(`${apiUrl}/workers`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err?.message || 'Failed to create worker profile')
        }
        // Optionally, we could add skills here by calling /workers/:id/skills if mapping exists
      } catch (e: any) {
        alert(e?.message || 'Could not complete onboarding')
        return
      }
    }

    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const prevStep = () => {
    const steps: OnboardingStep[] = ['role', 'profile', 'skills', 'location', 'completion']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'role':
        return profile.role !== null
      case 'profile':
        return profile.firstName && profile.lastName && profile.bio
      case 'skills':
        return profile.skills.length > 0
      case 'location':
        return profile.location && profile.availability
      default:
        return true
    }
  }

  const renderRoleSelection = () => (
    <div className="text-center mb-16">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Choose Your Role
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Select how you'll use ConnectGig to get your personalized experience
      </p>
    </div>
  )

  const renderProfileSetup = () => (
    <div className="text-center mb-16">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Complete Your Profile
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Tell us about yourself to help us personalize your experience
      </p>
    </div>
  )

  const renderSkillsSetup = () => (
    <div className="text-center mb-16">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        {profile.role === 'client' ? 'What Services Do You Need?' : 'What Services Do You Offer?'}
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Select your skills and expertise areas
      </p>
    </div>
  )

  const renderLocationSetup = () => (
    <div className="text-center mb-16">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Location & Availability
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Help clients find you or find services in your area
      </p>
    </div>
  )

  const renderCompletion = () => (
    <div className="text-center mb-16">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Profile Complete! 🎉
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        You're all set to start using ConnectGig
      </p>
    </div>
  )

  const commonSkills = [
    'Web Development', 'Mobile Development', 'Graphic Design', 'Content Writing',
    'Digital Marketing', 'Data Analysis', 'UI/UX Design', 'Video Editing',
    'Photography', 'Translation', 'Virtual Assistant', 'Social Media Management'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-20">
      <div className="container mx-auto px-4">
        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-4">
            {['role', 'profile', 'skills', 'location', 'completion'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step 
                    ? 'bg-primary text-white' 
                    : index < ['role', 'profile', 'skills', 'location', 'completion'].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < ['role', 'profile', 'skills', 'location', 'completion'].indexOf(currentStep) ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    index < ['role', 'profile', 'skills', 'location', 'completion'].indexOf(currentStep)
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'role' && (
          <>
            {renderRoleSelection()}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Client Role */}
              <Card 
                className="card-hover border-2 hover:border-primary/20 cursor-pointer"
                onClick={() => handleRoleSelection('client')}
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
                      <Star className="h-5 w-5 text-blue-600" />
                      <span>Find qualified workers</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      <span>Manage projects</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Worker Role */}
              <Card 
                className="card-hover border-2 hover:border-primary/20 cursor-pointer"
                onClick={() => handleRoleSelection('worker')}
              >
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">I Provide Services</CardTitle>
                  <CardDescription className="text-lg">
                    Offer your skills and grow your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span>Find job opportunities</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      <span>Earn money</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-yellow-600" />
                      <span>Build reputation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {currentStep === 'profile' && (
          <>
            {renderProfileSetup()}
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                      placeholder={profile.role === 'client' 
                        ? "Tell us about your business and what you're looking for..."
                        : "Tell us about your skills, experience, and what you offer..."
                      }
                      rows={4}
                    />
                  </div>

                  {profile.role === 'worker' && (
                    <>
                      <div>
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input
                          id="experience"
                          value={profile.experience}
                          onChange={(e) => handleProfileUpdate('experience', e.target.value)}
                          placeholder="e.g., 3 years"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                        <Input
                          id="hourlyRate"
                          value={profile.hourlyRate}
                          onChange={(e) => handleProfileUpdate('hourlyRate', e.target.value)}
                          placeholder="e.g., 25"
                        />
                      </div>
                      <div>
                        <Label htmlFor="portfolio">Portfolio URL (Optional)</Label>
                        <Input
                          id="portfolio"
                          value={profile.portfolio}
                          onChange={(e) => handleProfileUpdate('portfolio', e.target.value)}
                          placeholder="https://your-portfolio.com"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {currentStep === 'skills' && (
          <>
            {renderSkillsSetup()}
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {commonSkills.map((skill) => (
                      <Button
                        key={skill}
                        variant={profile.skills.includes(skill) ? "default" : "outline"}
                        className="h-auto py-3 px-4 text-sm"
                        onClick={() => handleSkillsUpdate(skill)}
                      >
                        {skill}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Label htmlFor="customSkill">Add Custom Skill</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="customSkill"
                        placeholder="Enter custom skill"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            handleSkillsUpdate(e.currentTarget.value.trim())
                            e.currentTarget.value = ''
                          }
                        }}
                      />
                      <Button
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement
                          if (input.value.trim()) {
                            handleSkillsUpdate(input.value.trim())
                            input.value = ''
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {currentStep === 'location' && (
          <>
            {renderLocationSetup()}
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => handleProfileUpdate('location', e.target.value)}
                      placeholder="City, State or Remote"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="availability">Availability</Label>
                    <Input
                      id="availability"
                      value={profile.availability}
                      onChange={(e) => handleProfileUpdate('availability', e.target.value)}
                      placeholder="e.g., Weekdays 9 AM - 6 PM, Remote"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {currentStep === 'completion' && (
          <>
            {renderCompletion()}
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Welcome to ConnectGig!</h3>
                  <p className="text-gray-600 mb-6">
                    Your profile is complete and you're ready to start using the platform.
                  </p>
                  <Link href="/dashboard">
                    <Button className="btn-primary">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Navigation Buttons */}
        {currentStep !== 'role' && currentStep !== 'completion' && (
          <div className="flex justify-between max-w-2xl mx-auto mt-8">
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button 
              className="btn-primary" 
              onClick={nextStep}
              disabled={!canProceed()}
            >
              {currentStep === 'location' ? 'Complete Profile' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
