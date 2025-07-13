"use client"

import { useEffect, useState } from 'react'
import { useAuth, useToast } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { podcastAPI } from '@/lib/api'
import { 
  ArrowLeft,
  Mic,
  Edit,
  Save
} from 'lucide-react'

interface Podcast {
  id: string
  judul: string
  genres: string[]
  tanggal_rilis: string
  tahun: number
}

export default function EditPodcastPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const params = useParams()
  const podcastId = params.id as string
  
  const [podcast, setPodcast] = useState<Podcast | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    judul: '',
    genres: [] as string[]
  })

  const availableGenres = [
    'Technology', 'Business', 'Health', 'Education', 'Entertainment', 
    'News', 'Sports', 'Comedy', 'Music', 'Science', 'History', 'Travel'
  ]

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    
    if (!user.is_podcaster) {
      router.push('/dashboard')
      return
    }
    
    loadPodcastData()
  }, [user, router, podcastId])

  const loadPodcastData = async () => {
    try {
      const data = await podcastAPI.getPodcastDetail(podcastId)
      setPodcast(data.podcast)
      setFormData({
        judul: data.podcast.judul,
        genres: data.podcast.genres || []
      })
    } catch (error) {
      showToast('Failed to load podcast data', 'error')
      router.push('/podcast')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.judul.trim() || formData.genres.length === 0) {
      showToast('Title and at least one genre are required', 'error')
      return
    }

    setSaving(true)
    try {
      await podcastAPI.updatePodcast(podcastId, {
        judul: formData.judul.trim(),
        genres: formData.genres
      })
      showToast('Podcast updated successfully!', 'success')
      router.push('/podcast')
    } catch (error: any) {
      showToast(error.message || 'Failed to update podcast', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading podcast...</p>
        </div>
      </div>
    )
  }

  if (!podcast) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Podcast Not Found</h1>
          <p className="text-gray-400 mb-4">The podcast you're looking for doesn't exist or has been removed.</p>
          <Button 
            onClick={() => router.push('/podcast')}
            className="btn-spotify"
          >
            Back to Podcasts
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="w-full max-w-5xl">
        <Card className="bg-gray-900/80 border-0 shadow-lg rounded-xl p-0">
          <CardContent className="p-8">
            <form id="edit-podcast-form" onSubmit={handleSave} className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  <Edit className="w-6 h-6 text-green-400" />
                  Edit Podcast
                </h1>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-700 text-white hover:bg-gray-800"
                    onClick={() => router.push('/podcast')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="btn-spotify"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
              <div>
                <div className="flex gap-8 text-sm text-gray-300 mb-4">
                  <span>
                    <span className="font-medium ">Release date:</span> {new Date(podcast.tanggal_rilis).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-8 text-sm text-gray-300 mb-4">
                  <span>
                    <span className="font-medium">Year:</span> {podcast.tahun}
                  </span>
                </div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Judul
                </label>
                <Input
                  type="text"
                  name="judul"
                  placeholder="Enter podcast title"
                  value={formData.judul}
                  onChange={handleInputChange}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Genre
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableGenres.map((genre) => (
                    <label key={genre} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.genres.includes(genre)}
                        onChange={() => handleGenreToggle(genre)}
                        className="rounded border-gray-300 bg-gray-800 text-green-500 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-300">{genre}</span>
                    </label>
                  ))}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 