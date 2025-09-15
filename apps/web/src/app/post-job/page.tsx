'use client'

import { useAuthWithBypass } from '@/lib/auth-utils'

// Disable static generation for this page
export const dynamic = 'force-dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Hammer, 
  Wrench, 
  Paintbrush, 
  Leaf, 
  Home, 
  MapPin, 
  Calendar, 
  DollarSign,
  Camera,
  Plus,
  X,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface JobPost {
  title: string
  category: string
  description: string
  budget: {
    min: string
    max: string
    type: 'fixed' | 'hourly' | 'negotiable'
  }
  location: string
  serviceArea: string
  timeline: string
  urgency: 'low' | 'medium' | 'high'
  photos: File[]
  requirements: string[]
}

const serviceCategories = [
  { id: 'plumbing', name: 'Plumbing', icon: Wrench, color: 'bg-blue-100 text-blue-800' },
  { id: 'electrical', name: 'Electrical', icon: Hammer, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'carpentry', name: 'Carpentry', icon: Hammer, color: 'bg-orange-100 text-orange-800' },
  { id: 'painting', name: 'Painting', icon: Paintbrush, color: 'bg-purple-100 text-purple-800' },
  { id: 'landscaping', name: 'Landscaping', icon: Leaf, color: 'bg-green-100 text-green-800' },
  { id: 'hvac', name: 'HVAC', icon: Home, color: 'bg-red-100 text-red-800' },
  { id: 'roofing', name: 'Roofing', icon: Home, color: 'bg-gray-100 text-gray-800' },
  { id: 'flooring', name: 'Flooring', icon: Home, color: 'bg-brown-100 text-brown-800' },
  { id: 'general', name: 'General Handyman', icon: Hammer, color: 'bg-indigo-100 text-indigo-800' }
]

const urgencyLevels = [
  { id: 'low', name: 'Low', color: 'bg-green-100 text-green-800', description: 'Can wait a few days' },
  { id: 'medium', name: 'Medium', color: 'bg-yellow-100 text-yellow-800', description: 'Needed within a week' },
  { id: 'high', name: 'High', color: 'bg-red-100 text-red-800', description: 'Urgent - needed ASAP' }
]

export default function PostJobPage() {
  const { isSignedIn, isLoaded, user } = useAuthWithBypass()
  const [jobPost, setJobPost] = useState<JobPost>({
    title: '',
    category: '',
    description: '',
    budget: {
      min: '',
      max: '',
      type: 'fixed'
    },
    location: '',
    serviceArea: '',
    timeline: '',
    urgency: 'medium',
    photos: [],
    requirements: []
  })
  const [newRequirement, setNewRequirement] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to post a job.</p>
          <Link href="/sign-in">
            <Button className="btn-primary">Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleInputChange = (field: keyof JobPost, value: any) => {
    setJobPost(prev => ({ ...prev, [field]: value }))
  }

  const handleBudgetChange = (field: keyof JobPost['budget'], value: any) => {
    setJobPost(prev => ({
      ...prev,
      budget: { ...prev.budget, [field]: value }
    }))
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setJobPost(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }))
  }

  const removePhoto = (index: number) => {
    setJobPost(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  const addRequirement = () => {
    if (newRequirement.trim() && !jobPost.requirements.includes(newRequirement.trim())) {
      setJobPost(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }))
      setNewRequirement('')
    }
  }

  const removeRequirement = (requirement: string) => {
    setJobPost(prev => ({
      ...prev,
      requirements: prev.requirements.filter(r => r !== requirement)
    }))
  }

  const canSubmit = () => {
    return (
      jobPost.title &&
      jobPost.category &&
      jobPost.description &&
      jobPost.budget.min &&
      jobPost.location &&
      jobPost.timeline
    )
  }

  const handleSubmit = async () => {
    if (!canSubmit()) return

    setIsSubmitting(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

      const token = await (window as any).Clerk?.session?.getToken?.()

      // Map UI fields to API DTO
      const payload = {
        title: jobPost.title,
        description: jobPost.description,
        category: jobPost.category.toUpperCase(),
        price: Number(jobPost.budget.max || jobPost.budget.min || 0),
        urgency: jobPost.urgency.toUpperCase(),
        scheduledDate: null as any,
        location: {
          address: jobPost.location,
          city: jobPost.location,
          state: '',
          country: '',
          latitude: 0,
          longitude: 0,
        },
        requirements: jobPost.requirements,
      }

      const res = await fetch(`${apiUrl}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || 'Failed to post job')
      }

      const data = await res.json()
      setIsSubmitting(false)
      alert('Job posted successfully!')
      // Optionally redirect to jobs or detail page later
      // router.push(`/jobs/${data.id}`)
    } catch (error: any) {
      console.error('Post job error:', error)
      setIsSubmitting(false)
      alert(error?.message || 'Something went wrong while posting the job')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Post a Home Service Job
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Describe your project and connect with qualified tradespeople in your area
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Fill in the details below to help tradespeople understand your project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Job Title */}
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={jobPost.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Fix leaky kitchen faucet, Install new bathroom vanity"
                className="mt-2"
              />
            </div>

            {/* Service Category */}
            <div>
              <Label>Service Category *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {serviceCategories.map((category) => {
                  const Icon = category.icon
                  return (
                    <div
                      key={category.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        jobPost.category === category.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/30'
                      }`}
                      onClick={() => handleInputChange('category', category.id)}
                    >
                      <div className="text-center">
                        <Icon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Job Description */}
            <div>
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                value={jobPost.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your project in detail. Include what needs to be done, any specific requirements, and any relevant context..."
                rows={6}
                className="mt-2"
              />
            </div>

            {/* Budget */}
            <div>
              <Label>Budget *</Label>
              <div className="grid md:grid-cols-3 gap-4 mt-2">
                <div>
                  <Label htmlFor="budgetMin">Minimum</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="budgetMin"
                      type="number"
                      value={jobPost.budget.min}
                      onChange={(e) => handleBudgetChange('min', e.target.value)}
                      placeholder="0"
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="budgetMax">Maximum</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="budgetMax"
                      type="number"
                      value={jobPost.budget.max}
                      onChange={(e) => handleBudgetChange('max', e.target.value)}
                      placeholder="1000"
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <Label>Budget Type</Label>
                  <select
                    value={jobPost.budget.type}
                    onChange={(e) => handleBudgetChange('type', e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly Rate</option>
                    <option value="negotiable">Negotiable</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location & Service Area */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={jobPost.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, State"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="serviceArea">Service Area</Label>
                <Input
                  id="serviceArea"
                  value={jobPost.serviceArea}
                  onChange={(e) => handleInputChange('serviceArea', e.target.value)}
                  placeholder="e.g., Within 20 miles, Downtown area"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Timeline & Urgency */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="timeline">Timeline *</Label>
                <Input
                  id="timeline"
                  value={jobPost.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  placeholder="e.g., Within 1 week, Flexible"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Urgency Level</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {urgencyLevels.map((level) => (
                    <div
                      key={level.id}
                      className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                        jobPost.urgency === level.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/30'
                      }`}
                      onClick={() => handleInputChange('urgency', level.id)}
                    >
                      <Badge className={level.color}>{level.name}</Badge>
                      <p className="text-xs text-gray-600 mt-1">{level.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Photos */}
            <div>
              <Label>Photos (Optional)</Label>
              <p className="text-sm text-gray-600 mb-2">
                Add photos to help tradespeople understand your project better
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {jobPost.photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {jobPost.photos.length < 8 && (
                  <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    <Camera className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      multiple
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <Label>Specific Requirements</Label>
              <p className="text-sm text-gray-600 mb-2">
                Add any specific requirements or preferences
              </p>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="e.g., Licensed contractor, 5+ years experience"
                  onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                />
                <Button onClick={addRequirement} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {jobPost.requirements.map((req, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {req}
                    <button
                      onClick={() => removeRequirement(req)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit() || isSubmitting}
                className="w-full btn-primary"
                size="lg"
              >
                {isSubmitting ? 'Posting Job...' : 'Post Job'}
              </Button>
              {!canSubmit() && (
                <div className="flex items-center gap-2 mt-2 text-sm text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  Please fill in all required fields marked with *
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
