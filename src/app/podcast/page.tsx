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
  const { showToast } = useToast()
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

  const handleAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPodcast) return

    try {
      await podcastAPI.createEpisode({
        id_konten_podcast: selectedPodcast.id_konten,
        ...episodeForm
      })
      setEpisodeForm({ judul: '', deskripsi: '', durasi: 0 })
      setShowEpisodeForm(false)
      setSelectedPodcast(null)
      await loadPodcasts()
      showToast('Episode added successfully!', 'success')
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Failed to add episode', 'error')
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
      await handleDeletePodcast(podcastToDelete.id_konten)
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Podcasts</h1>
              <p className="text-gray-400">Manage your podcast content</p>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="btn-spotify"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Podcast
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

        {/* Add Episode Form */}
        {showEpisodeForm && selectedPodcast && (
          <Card className="mb-6 bg-gray-900/80 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-green-400" />
                Add Episode to "{selectedPodcast.judul}"
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddEpisode} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Episode Title
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter episode title"
                    value={episodeForm.judul}
                    onChange={(e) => setEpisodeForm(prev => ({ ...prev, judul: e.target.value }))}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter episode description"
                    value={episodeForm.deskripsi}
                    onChange={(e) => setEpisodeForm(prev => ({ ...prev, deskripsi: e.target.value }))}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter duration in minutes"
                    value={episodeForm.durasi}
                    onChange={(e) => setEpisodeForm(prev => ({ ...prev, durasi: Number(e.target.value) }))}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                    required
                    min="1"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="btn-spotify">
                    Add Episode
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-800"
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
          <Card className="bg-gray-900/80 border-0 shadow-md">
            <CardContent className="text-center py-12">
              <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Podcasts Yet</h3>
              <p className="text-gray-400 mb-4">You haven't created any podcasts yet.</p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="btn-spotify"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Podcast
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {podcasts.map((podcast) => (
              <Card key={podcast.id_konten} className="bg-gray-900/80 border-0 shadow-md hover:border-green-500/50 transition-all">
                <CardHeader>
                  <CardTitle className="text-lg text-white">{podcast.judul}</CardTitle>
                  <div className="flex flex-wrap gap-1">
                    {podcast.genres.map((genre, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                        {genre}
                      </span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-400">
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
                        className="flex-1 btn-spotify"
                        onClick={() => router.push(`/podcast/${podcast.id_konten}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-gray-600 text-white hover:bg-gray-800"
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
                        className="border-gray-600 text-white hover:bg-gray-800"
                        onClick={() => router.push(`/podcast/${podcast.id_konten}/edit`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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