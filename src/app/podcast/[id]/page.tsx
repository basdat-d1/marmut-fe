"use client"

import { useEffect, useState } from 'react'
import { useAuth, useToast } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { createPortal } from 'react-dom'
import { podcastAPI } from '@/lib/api'
import { 
  ArrowLeft,
  Mic,
  Play,
  Trash2
} from 'lucide-react'

interface Episode {
  id: string
  judul: string
  deskripsi: string
  durasi: string
  tanggal_rilis: string
}

interface Podcast {
  id: string
  judul: string
  genres: string[]
  podcaster: string
  total_durasi: string
  tanggal_rilis: string
  episodes: Episode[]
}

export default function PodcastDetailPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const params = useParams()
  const podcastId = params.id as string
  
  const [podcast, setPodcast] = useState<Podcast | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddEpisode, setShowAddEpisode] = useState(false)
  const [episodeForm, setEpisodeForm] = useState({
    judul: '',
    deskripsi: '',
    durasi: ''
  })
  const [modalContainer, setModalContainer] = useState<Element | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [episodeToDelete, setEpisodeToDelete] = useState<Episode | null>(null)

  useEffect(() => {
    setModalContainer(document.body)
  }, [])

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    loadPodcastData()
  }, [user, router, podcastId])

  const loadPodcastData = async () => {
    try {
      const [podcastData, episodesData] = await Promise.all([
        podcastAPI.getPodcastDetail(podcastId),
        podcastAPI.getPodcastEpisodes(podcastId)
      ])
      
      // Combine podcast and episodes data
      const combinedData = {
        ...podcastData.podcast,
        episodes: episodesData.episodes || []
      }
      setPodcast(combinedData)
    } catch (error) {
      showToast('Failed to load podcast data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePlayEpisode = async (episodeId: string) => {
    try {
      await podcastAPI.playPodcastEpisode(podcastId, episodeId)
      showToast('Episode played successfully!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to play episode', 'error')
    }
  }

  const getYear = (dateString: string) => {
    const date = new Date(dateString)
    return date.getFullYear()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const formatDuration = (duration: string) => duration

  const isPodcaster = user && podcast && user.nama === podcast.podcaster

  const handleAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!podcast) return;
    try {
      await podcastAPI.createEpisode({
        id_konten_podcast: podcast.id,
        judul: episodeForm.judul,
        deskripsi: episodeForm.deskripsi,
        durasi: parseInt(episodeForm.durasi)
      })
      setEpisodeForm({ judul: '', deskripsi: '', durasi: '' })
      setShowAddEpisode(false)
      await loadPodcastData()
      showToast('Episode added successfully!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to add episode', 'error')
    }
  }

  const handleDeleteEpisode = async (episodeId: string) => {
    if (!podcast) return;
    try {
      await podcastAPI.deleteEpisode(podcast.id, episodeId)
      await loadPodcastData()
      showToast('Episode deleted successfully!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to delete episode', 'error')
    }
  }

  const handleDeleteConfirm = async () => {
    if (episodeToDelete) {
      await handleDeleteEpisode(episodeToDelete.id)
      setEpisodeToDelete(null)
    }
    setShowDeleteConfirm(false)
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
            onClick={() => router.push('/search')}
            className="btn-spotify"
          >
            Back to Search
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Podcast Information */}
        <Card className="mb-6 bg-gray-900/80 border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white text-2xl flex items-center gap-2">
              <Mic className="w-6 h-6 text-blue-400" />
              {podcast.judul}
            </CardTitle>
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Genre(s):</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {podcast.genres.map((genre, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Podcaster:</label>
                <p className="text-white">{podcast.podcaster}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Total Durasi:</label>
                <p className="text-white">{podcast.total_durasi}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Tanggal Rilis:</label>
                <p className="text-white">{formatDate(podcast.tanggal_rilis)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Tahun:</label>
                <p className="text-white">{getYear(podcast.tanggal_rilis)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-400" />
              Episodes List
            </CardTitle>
            {isPodcaster && (
              <Button className="btn-spotify" onClick={() => setShowAddEpisode(true)}>
                + Add Episode
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {modalContainer && showAddEpisode && createPortal(
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                <div className="bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md relative">
                  <h2 className="text-xl font-bold text-white mb-4">CREATE EPISODE</h2>
                  <form onSubmit={handleAddEpisode} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Podcast:</label>
                      <p className="text-gray-300 mb-2">{podcast.judul}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Judul:</label>
                      <input
                        type="text"
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                        value={episodeForm.judul}
                        onChange={e => setEpisodeForm(f => ({ ...f, judul: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Deskripsi:</label>
                      <textarea
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                        rows={3}
                        value={episodeForm.deskripsi}
                        onChange={e => setEpisodeForm(f => ({ ...f, deskripsi: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Durasi:</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                        value={episodeForm.durasi}
                        onChange={e => setEpisodeForm(f => ({ ...f, durasi: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="flex space-x-2 justify-end">
                      <Button type="button" variant="outline" className="border-gray-600 text-white hover:bg-gray-800" onClick={() => setShowAddEpisode(false)}>Cancel</Button>
                      <Button type="submit" className="btn-spotify">SUBMIT</Button>
                    </div>
                  </form>
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
                    onClick={() => setShowAddEpisode(false)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>
              </div>,
              modalContainer
            )}
            {podcast.episodes.length === 0 ? (
              <div className="text-center py-8">
                <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Episodes Yet</h3>
                <p className="text-gray-400">This podcast doesn't have any episodes yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                                  <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Judul Episode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Deskripsi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Durasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                  <tbody className="divide-y divide-gray-800">
                    {podcast.episodes.map((episode) => (
                      <tr key={episode.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{episode.judul}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300 max-w-xs truncate">
                            {episode.deskripsi}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDuration(episode.durasi)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(episode.tanggal_rilis)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              className="btn-spotify"
                              onClick={() => handlePlayEpisode(episode.id)}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            {isPodcaster && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                                onClick={() => {
                                  setEpisodeToDelete(episode)
                                  setShowDeleteConfirm(true)
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false)
            setEpisodeToDelete(null)
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Episode"
          message={`Are you sure you want to delete "${episodeToDelete?.judul}"? This action cannot be undone.`}
          type="delete"
          confirmText="Delete Episode"
        />
      </div>
    </div>
  )
} 