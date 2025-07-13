"use client"

import { useEffect, useState } from 'react'
import { useAuth, useToast } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { podcastAPI } from '@/lib/api'
import { 
  Plus, 
  Trash2, 
  Mic, 
  Clock,
  Eye,
  Library
} from 'lucide-react'

interface Podcast {
  id: string
  judul: string
  total_durasi: string
  episode_count: number
  tanggal_rilis: string
  genres?: string[]
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
  const { showToast } = useToast()
  const router = useRouter()
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({
    judul: '',
    genres: [] as string[]
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [podcastToDelete, setPodcastToDelete] = useState<Podcast | null>(null)

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
      showToast('Failed to load podcasts', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePodcast = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await podcastAPI.createPodcast({
        judul: createForm.judul,
        deskripsi: '',
        genres: createForm.genres
      })
      setCreateForm({ judul: '', genres: [] })
      setShowCreateForm(false)
      await loadPodcasts()
      showToast('Podcast created successfully!', 'success')
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Failed to create podcast', 'error')
    }
  }

  const handleDeletePodcast = async (podcastId: string) => {
    try {
      await podcastAPI.deletePodcast(podcastId)
      await loadPodcasts()
      showToast('Podcast deleted successfully!', 'success')
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Failed to delete podcast', 'error')
    }
  }

  const handleDeleteConfirm = async () => {
    if (podcastToDelete) {
      await handleDeletePodcast(podcastToDelete.id)
      setPodcastToDelete(null)
    }
    setShowDeleteConfirm(false)
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">User Podcast</h1>
              <p className="text-gray-400">Manage your podcast collections</p>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="btn-spotify"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Podcast
            </Button>
          </div>
        </div>

        {/* Create Podcast Form */}
        {showCreateForm && (
          <Card className="mb-6 bg-gray-900/80 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-400" />
                Create New Podcast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePodcast} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Podcast Title
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter podcast title"
                    value={createForm.judul}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, judul: e.target.value }))}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Genres
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableGenres.map((genre) => (
                      <label key={genre} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={createForm.genres.includes(genre)}
                          onChange={() => handleGenreToggle(genre)}
                          className="rounded border-gray-300 bg-gray-800 text-green-500 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-300">{genre}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="btn-spotify">
                    Create Podcast
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-800"
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

        {/* Podcast Stats */}
        {podcasts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-green-900/30 to-green-800/30 border-green-500/30">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                    <Library className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Podcasts</p>
                    <p className="text-white font-bold text-xl">{podcasts.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                    <Mic className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Episodes</p>
                    <p className="text-white font-bold text-xl">
                      {podcasts.reduce((sum, podcast) => sum + (podcast.episode_count || 0), 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Duration</p>
                    <p className="text-white font-bold text-xl">
                      {podcasts.length === 1
                        ? podcasts[0].total_durasi
                        : podcasts.map(p => p.total_durasi).join(' + ')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Podcasts Table */}
        <Card className="bg-gray-900/80 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Mic className="w-5 h-5 mr-2 text-blue-400" />
              Your Podcasts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Podcast
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Episodes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {podcasts.map((podcast) => (
                    <tr key={podcast.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center mr-3">
                            <Mic className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{podcast.judul}</div>
                            {/* Add description or genres if available */}
                            <div className="text-sm text-gray-400">
                              {(podcast.genres || []).join(', ')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mic className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-300">{podcast.episode_count} episodes</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-300">{podcast.total_durasi}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="btn-spotify"
                            onClick={() => router.push(`/podcast/${podcast.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Detail
                          </Button>
                          {/* <Button 
                            size="sm" 
                            variant="outline"
                            className="border-gray-700 text-white hover:bg-gray-800"
                            onClick={() => router.push(`/podcast/${podcast.id}/edit`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button> */}
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                            onClick={() => {
                              setPodcastToDelete(podcast)
                              setShowDeleteConfirm(true)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false)
            setPodcastToDelete(null)
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Podcast"
          message={`Are you sure you want to delete "${podcastToDelete?.judul}"? This action cannot be undone.`}
          type="delete"
          confirmText="Delete Podcast"
        />
      </div>
    </div>
  )
} 