'use client'

import { Button } from '@/components/ui/button'

// Disable static generation for this page
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Clock,
  Star,
  Eye,
  Briefcase,
  Wrench,
  Paintbrush,
  Leaf,
  Home,
  Hammer
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { useAuthWithBypass } from '@/lib/auth-utils'

interface Job {
  id: string
  title: string
  category: string
  description: string
  budget: {
    min: number
    max: number
    type: 'fixed' | 'hourly' | 'negotiable'
  }
  location: string
  serviceArea: string
  timeline: string
  urgency: 'low' | 'medium' | 'high'
  postedDate: string
  clientRating: number
  clientReviewCount: number
  requirements: string[]
  photos: string[]
}

interface ApiJob {
  id: string
  title: string
  description: string
  category: string
  price: number
  status: string
  urgency: string
  location?: { address: string; city: string }
  createdAt: string
}

const serviceCategories = [
  { id: 'all', name: 'All Services', icon: Briefcase },
  { id: 'plumbing', name: 'Plumbing', icon: Wrench },
  { id: 'electrical', name: 'Electrical', icon: Hammer },
  { id: 'carpentry', name: 'Carpentry', icon: Hammer },
  { id: 'painting', name: 'Painting', icon: Paintbrush },
  { id: 'landscaping', name: 'Landscaping', icon: Leaf },
  { id: 'hvac', name: 'HVAC', icon: Home },
  { id: 'roofing', name: 'Roofing', icon: Home },
  { id: 'flooring', name: 'Flooring', icon: Home },
  { id: 'general', name: 'General Handyman', icon: Hammer }
]

const urgencyFilters = [
  { id: 'all', name: 'All Urgency' }, 
  { id: 'high', name: 'High Priority' },
  { id: 'medium', name: 'Medium Priority' },
  { id: 'low', name: 'Low Priority' }
]

export default function JobsPage() {
  const { isSignedIn, isLoaded, user } = useAuthWithBypass()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedUrgency, setSelectedUrgency] = useState('all')
  const [selectedBudget, setSelectedBudget] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [jobs, setJobs] = useState<ApiJob[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const headers: Record<string, string> = {}
      // Optional: include token if needed for scoped lists later
      try {
        const token = await (window as any).Clerk?.session?.getToken?.()
        if (token) headers['Authorization'] = `Bearer ${token}`
      } catch {}
      const res = await fetch(`${apiUrl}/public/jobs?status=PENDING`, { headers })
      if (!res.ok) throw new Error('Failed to load jobs')
      const data: ApiJob[] = await res.json()
      setJobs(data)
    } catch (e: any) {
      setError(e?.message || 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [apiUrl])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleAccept = async (jobId: string) => {
    if (!user?.id) return
    try {
      setAcceptingId(jobId)
      const token = await (window as any).Clerk?.session?.getToken?.()
      const res = await fetch(`${apiUrl}/jobs/${jobId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ workerId: user.id }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || 'Failed to accept job')
      }
      setJobs(prev => prev.filter(j => j.id !== jobId))
    } catch (e: any) {
      alert(e?.message || 'Could not accept job')
    } finally {
      setAcceptingId(null)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    )
  }

  // Allow browsing without sign-in; accepting a job will still require auth

  const normalizedJobs: Job[] = jobs.map(j => ({
    id: j.id,
    title: j.title,
    category: j.category?.toLowerCase() || 'general',
    description: j.description,
    budget: { min: j.price, max: j.price, type: 'fixed' },
    location: j.location?.city || j.location?.address || 'Unknown',
    serviceArea: '',
    timeline: 'Flexible',
    urgency: (j.urgency?.toLowerCase() as Job['urgency']) || 'medium',
    postedDate: new Date(j.createdAt).toLocaleString(),
    clientRating: 4.8,
    clientReviewCount: 0,
    requirements: [],
    photos: [],
  }))

  // Filter jobs based on selected criteria
  const filteredJobs = normalizedJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory
    const matchesUrgency = selectedUrgency === 'all' || job.urgency === selectedUrgency
    let matchesBudget = true
    if (selectedBudget === 'low' && job.budget.max > 300) matchesBudget = false
    if (selectedBudget === 'medium' && (job.budget.min < 300 || job.budget.max > 1000)) matchesBudget = false
    if (selectedBudget === 'high' && job.budget.min < 1000) matchesBudget = false
    return matchesSearch && matchesCategory && matchesUrgency && matchesBudget
  })

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
      case 'budget-high':
        return b.budget.max - a.budget.max
      case 'budget-low':
        return a.budget.min - b.budget.min
      case 'urgent':
        const urgencyOrder = { high: 3, medium: 2, low: 1 }
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
      default:
        return 0
    }
  })

  const getCategoryIcon = (categoryId: string) => {
    const category = serviceCategories.find(c => c.id === categoryId)
    if (category) {
      const Icon = category.icon
      return <Icon className="h-5 w-5" />
    }
    return <Briefcase className="h-5 w-5" />
  }

  const getUrgencyBadge = (urgency: 'low' | 'medium' | 'high') => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    }
    return (
      <Badge className={colors[urgency]}>
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Priority
      </Badge>
    )
  }

  const formatBudget = (budget: Job['budget']) => {
    if (budget.type === 'hourly') {
      return `$${budget.min}-${budget.max}/hr`
    }
    return `$${budget.min}-$${budget.max}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Find Home Service Jobs
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse available jobs in your area and apply to projects that match your skills
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <Card>
            <CardContent className="pt-6">
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search jobs by title, description, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid md:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Service Category</Label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {serviceCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Urgency Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Urgency</Label>
                  <select
                    value={selectedUrgency}
                    onChange={(e) => setSelectedUrgency(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {urgencyFilters.map(filter => (
                      <option key={filter.id} value={filter.id}>
                        {filter.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Budget Range</Label>
                  <select
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">All Budgets</option>
                    <option value="low">Under $300</option>
                    <option value="medium">$300 - $1,000</option>
                    <option value="high">Over $1,000</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Sort By</Label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="budget-high">Highest Budget</option>
                    <option value="budget-low">Lowest Budget</option>
                    <option value="urgent">Most Urgent</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {sortedJobs.length} job{sortedJobs.length !== 1 ? 's' : ''} found
            </h2>
            <Link href="/post-job">
              <Button className="btn-primary">
                Post a Job
              </Button>
            </Link>
          </div>

          {/* Job Listings */}
          <div className="space-y-4">
            {sortedJobs.map(job => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Job Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(job.category)}
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        </div>
                        {getUrgencyBadge(job.urgency)}
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatBudget(job.budget)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{job.timeline}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{job.postedDate}</span>
                        </div>
                      </div>

                      {/* Requirements */}
                      {job.requirements.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
                          <div className="flex flex-wrap gap-2">
                            {job.requirements.map((req, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Client Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{job.clientRating}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          ({job.clientReviewCount} reviews)
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 md:w-40">
                      <Link href={`/jobs/${job.id}`} className="w-full">
                        <Button className="btn-primary w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        disabled={!!acceptingId}
                        onClick={() => handleAccept(job.id)}
                      >
                        <Briefcase className="h-4 w-4 mr-2" />
                        {acceptingId === job.id ? 'Accepting...' : 'Accept Job'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Jobs Found */}
          {sortedJobs.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or check back later for new opportunities.
                </p>
                <Link href="/post-job">
                  <Button className="btn-primary">
                    Post a Job
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
