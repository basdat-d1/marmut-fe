"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { podcastAPI } from '@/lib/api'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Mic, 
  Clock,
  PlusCircle,
  Eye
} from 'lucide-react'

interface Podcast {
  id_konten: string
  judul: string
  jumlah_episode: number
  total_durasi: number
  genres: string[]
}

interface Episode {
  id_episode: string
  judul: string
  deskripsi: string
  durasi: number
  tanggal_rilis: string
}

export default function PodcastPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEpisodeForm, setShowEpisodeForm] = useState(false)
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null)
  const [createForm, setCreateForm] = useState({
    judul: '',
    genres: [] as string[]
  })
  const [episodeForm, setEpisodeForm] = useState({
    judul: '',
    deskripsi: '',
    durasi: 0
  })
  const [error, setError] = useState('')

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
    
    loadPodcasts()
  }, [user, router])

  const loadPodcasts = async () => {
    try {
      const data = await podcastAPI.getUserPodcasts()
      setPodcasts(data.podcasts || [])
    } catch (error) {
      console.error('Failed to load podcasts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePodcast = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await podcastAPI.createPodcast({
        judul: createForm.judul,
        genre: createForm.genres
      })
      setCreateForm({ judul: '', genres: [] })
      setShowCreateForm(false)
      loadPodcasts()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create podcast')
    }
  }

  const handleAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPodcast) return

    setError('')
    try {
      await podcastAPI.createEpisode({
        id_konten_podcast: selectedPodcast.id_konten,
        ...episodeForm
      })
      setEpisodeForm({ judul: '', deskripsi: '', durasi: 0 })
      setShowEpisodeForm(false)
      setSelectedPodcast(null)
      loadPodcasts()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to add episode')
    }
  }

  const handleDeletePodcast = async (podcastId: string) => {
    if (!confirm('Are you sure you want to delete this podcast?')) return

    try {
      await podcastAPI.deletePodcast(podcastId)
      loadPodcasts()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete podcast')
    }
  }

  const handleGenreToggle = (genre: string) => {
    setCreateForm(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }))
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} menit`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours} jam ${remainingMinutes} menit`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading podcasts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Podcasts</h1>
              <p className="text-gray-400">Manage your podcast content</p>
            </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Podcast
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Create Podcast Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Podcast</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePodcast} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Podcast Title
                </label>
                <Input
                  type="text"
                  placeholder="Enter podcast title"
                  value={createForm.judul}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, judul: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genres
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableGenres.map((genre) => (
                    <label key={genre} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={createForm.genres.includes(genre)}
                        onChange={() => handleGenreToggle(genre)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{genre}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">
                  Create Podcast
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    setCreateForm({ judul: '', genres: [] })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Add Episode Form */}
      {showEpisodeForm && selectedPodcast && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Episode to "{selectedPodcast.judul}"</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddEpisode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Episode Title
                </label>
                <Input
                  type="text"
                  placeholder="Enter episode title"
                  value={episodeForm.judul}
                  onChange={(e) => setEpisodeForm(prev => ({ ...prev, judul: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Input
                  type="text"
                  placeholder="Enter episode description"
                  value={episodeForm.deskripsi}
                  onChange={(e) => setEpisodeForm(prev => ({ ...prev, deskripsi: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <Input
                  type="number"
                  placeholder="Enter duration in minutes"
                  value={episodeForm.durasi}
                  onChange={(e) => setEpisodeForm(prev => ({ ...prev, durasi: Number(e.target.value) }))}
                  required
                  min="1"
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit">
                  Add Episode
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowEpisodeForm(false)
                    setSelectedPodcast(null)
                    setEpisodeForm({ judul: '', deskripsi: '', durasi: 0 })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Podcasts List */}
      {podcasts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Podcasts Yet</h3>
            <p className="text-gray-600 mb-4">You haven't created any podcasts yet.</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Podcast
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {podcasts.map((podcast) => (
            <Card key={podcast.id_konten} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{podcast.judul}</CardTitle>
                <div className="flex flex-wrap gap-1">
                  {podcast.genres.map((genre, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      {genre}
                    </span>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Mic className="w-4 h-4 mr-1" />
                      {podcast.jumlah_episode} episodes
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDuration(podcast.total_durasi)}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/podcast/${podcast.id_konten}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedPodcast(podcast)
                        setShowEpisodeForm(true)
                      }}
                    >
                      <PlusCircle className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => router.push(`/podcast/${podcast.id_konten}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeletePodcast(podcast.id_konten)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  )
} 