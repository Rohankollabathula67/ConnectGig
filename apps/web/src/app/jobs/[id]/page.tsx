'use client'

import { useAuthWithBypass } from '@/lib/auth-utils'

// Disable static generation for this page
export const dynamic = 'force-dynamic'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, DollarSign, Calendar, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ApiJob {
  id: string
  clientId: string
  workerId: string | null
  title: string
  description: string
  category: string
  price: number
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  createdAt: string
  updatedAt: string
  location?: {
    address: string
    city: string
    state: string
    country: string
    latitude: number
    longitude: number
  } | null
  client?: { id: string; name: string; email: string } | null
  worker?: { id: string; name: string; email: string } | null
}

export default function JobDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { isSignedIn, isLoaded, user } = useAuthWithBypass()
  const [job, setJob] = useState<ApiJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<null | 'accept' | 'start' | 'complete'>(null)
  const [error, setError] = useState<string | null>(null)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState<number>(5)
  const [reviews, setReviews] = useState<Array<{ id: string; rating: number; text: string; reviewer?: { id: string; name: string } }>>([])

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  const devBypass = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true'
  const devUserId = process.env.NEXT_PUBLIC_DEV_USER_ID || ''

  const urgencyBadge = (u?: ApiJob['urgency']) => {
    const map: Record<string, string> = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-red-100 text-red-800',
      URGENT: 'bg-red-200 text-red-900',
    }
    if (!u) return null
    return <Badge className={map[u] || ''}>{u.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</Badge>
  }

  const canAccept = useMemo(() => {
    return job && job.status === 'PENDING'
  }, [job])

  const isAssignedWorker = useMemo(() => {
    return job && (user?.id || devUserId) && job.workerId === (user?.id || devUserId)
  }, [job, user?.id, devUserId])

  const canStart = useMemo(() => {
    return job && isAssignedWorker && job.status === 'ACCEPTED'
  }, [job, isAssignedWorker])

  const canComplete = useMemo(() => {
    return job && isAssignedWorker && job.status === 'IN_PROGRESS'
  }, [job, isAssignedWorker])

  const isClient = useMemo(() => job && (user?.id || '') && job.clientId === (user?.id || ''), [job, user?.id])
  const canReview = useMemo(() => job && isClient && job.status === 'COMPLETED', [job, isClient])

  async function buildAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {}
    try {
      const token = await (window as any).Clerk?.session?.getToken?.()
      if (token) headers['Authorization'] = `Bearer ${token}`
      else if (devBypass && devUserId) headers['x-dev-user-id'] = devUserId
    } catch {
      if (devBypass && devUserId) headers['x-dev-user-id'] = devUserId
    }
    return headers
  }

  useEffect(() => {
    const fetchJob = async () => {
      if (!params?.id) return
      setLoading(true)
      setError(null)
      try {
        const headers = await buildAuthHeaders()
        const res = await fetch(`${apiUrl}/jobs/${params.id}`, { headers })
        if (!res.ok) throw new Error('Failed to load job')
        const data: ApiJob = await res.json()
        setJob(data)
      } catch (e: any) {
        setError(e?.message || 'Failed to load job')
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [params?.id])

  useEffect(() => {
    const fetchReviews = async () => {
      if (!params?.id) return
      try {
        const res = await fetch(`${apiUrl}/jobs/${params.id}/reviews`)
        if (res.ok) {
          const data = await res.json()
          setReviews(data)
        }
      } catch {}
    }
    fetchReviews()
  }, [params?.id])

  const runAction = async (action: 'accept' | 'start' | 'complete') => {
    if (!job) return
    try {
      setActionLoading(action)
      const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(await buildAuthHeaders()) }
      let url = ''
      let method = 'PATCH'
      let body: any = {}
      if (action === 'accept') {
        url = `${apiUrl}/jobs/${job.id}/accept`
        method = 'POST'
        const workerId = user?.id || (devBypass ? devUserId : undefined)
        body = { workerId }
      } else if (action === 'start') {
        url = `${apiUrl}/jobs/${job.id}/start`
      } else if (action === 'complete') {
        url = `${apiUrl}/jobs/${job.id}/complete`
        body = { completionNotes: 'Completed via web UI' }
      }
      const res = await fetch(url, { method, headers, body: Object.keys(body).length ? JSON.stringify(body) : undefined })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || 'Action failed')
      }
      const updated = await res.json()
      setJob(updated)
    } catch (e: any) {
      alert(e?.message || 'Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!job) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{job.title}</CardTitle>
                <CardDescription>Job ID: {job.id}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {urgencyBadge(job.urgency)}
                <Badge variant="secondary">{job.status.replaceAll('_', ' ')}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>

            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2"><DollarSign className="h-4 w-4" /><span>${job.price}</span></div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>{new Date(job.createdAt).toLocaleString()}</span></div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{job.location?.address || job.location?.city || 'N/A'}</span></div>
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>Updated {new Date(job.updatedAt).toLocaleString()}</span></div>
            </div>

            <div className="flex flex-wrap gap-2">
              {canAccept && (
                <Button onClick={() => runAction('accept')} disabled={actionLoading !== null}>
                  {actionLoading === 'accept' ? 'Accepting...' : 'Accept Job'}
                </Button>
              )}
              {canStart && (
                <Button onClick={() => runAction('start')} disabled={actionLoading !== null}>
                  {actionLoading === 'start' ? 'Starting...' : 'Start Job'}
                </Button>
              )}
              {canComplete && (
                <Button onClick={() => runAction('complete')} disabled={actionLoading !== null}>
                  {actionLoading === 'complete' ? 'Completing...' : 'Complete Job'}
                </Button>
              )}
            </div>

            {/* Reviews */}
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold">Reviews</h3>
              {reviews.length === 0 && <p className="text-gray-500 text-sm">No reviews yet.</p>}
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className="border rounded-md p-3">
                    <div className="text-sm text-gray-600">Rating: {r.rating}/5</div>
                    <div className="text-gray-800">{r.text}</div>
                  </div>
                ))}
              </div>

              {canReview && (
                <div className="border rounded-md p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm">Rating</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="p-2 border rounded"
                    >
                      {[5,4,3,2,1].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <textarea
                    className="w-full p-2 border rounded mb-2"
                    rows={3}
                    placeholder="Share your experience..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                  <Button
                    onClick={async () => {
                      try {
                        const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(await buildAuthHeaders()) }
                        const res = await fetch(`${apiUrl}/jobs/${job!.id}/reviews`, {
                          method: 'POST',
                          headers,
                          body: JSON.stringify({ rating: reviewRating, text: reviewText }),
                        })
                        if (!res.ok) {
                          const err = await res.json().catch(() => ({}))
                          throw new Error(err?.message || 'Failed to submit review')
                        }
                        const created = await res.json()
                        setReviews(prev => [created, ...prev])
                        setReviewText('')
                        setReviewRating(5)
                      } catch (e: any) {
                        alert(e?.message || 'Could not submit review')
                      }
                    }}
                    disabled={!reviewText.trim()}
                  >
                    Submit Review
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
