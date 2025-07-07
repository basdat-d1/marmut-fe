"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { podcastAPI } from '@/lib/api'
import { 
  ArrowLeft, 
  Mic, 
  Clock, 
  Calendar,
  Play,
  Trash2,
  Plus
} from 'lucide-react'

interface Podcast {
  id_konten: string
  judul: string
  durasi: number
  tanggal_rilis: string
  tahun: number
  podcaster: string
  genres: string[]
}

interface Episode {
  id_episode: string
  judul: string
  deskripsi: string
  durasi: number
  tanggal_rilis: string
}

export default function PodcastDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const podcastId = params.id as string

  const [podcast, setPodcast] = useState<Podcast | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    loadPodcastData()
  }, [user, router, podcastId])

  const loadPodcastData = async () => {
    try {
      const data = await podcastAPI.getPodcastDetail(podcastId)
      setPodcast(data.podcast)
      setEpisodes(data.episodes || [])
    } catch (error) {
      console.error('Failed to load podcast data:', error)
      setError('Failed to load podcast information')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEpisode = async (episodeId: string) => {
    if (!confirm('Are you sure you want to delete this episode?')) return

    try {
      await podcastAPI.deleteEpisode(episodeId)
      setEpisodes(prev => prev.filter(episode => episode.id_episode !== episodeId))
    } catch (error: any) {
      setError(error.message || 'Failed to delete episode')
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
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
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="text-center py-12">
            <Mic className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Podcast Not Found</h3>
            <p className="text-gray-400 mb-4">The podcast you're looking for doesn't exist.</p>
            <Button 
              onClick={() => router.back()}
              className="btn-spotify"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Podcast Information */}
        <Card className="mb-6 bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl text-white">{podcast.judul}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mic className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-400">Podcaster</p>
                    <p className="font-medium text-white">{podcast.podcaster}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-400">Total Duration</p>
                    <p className="font-medium text-white">{formatDuration(podcast.durasi)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-400">Release Date</p>
                    <p className="font-medium text-white">{formatDate(podcast.tanggal_rilis)}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">Genres</p>
                <div className="flex flex-wrap gap-2">
                  {podcast.genres.map((genre, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Episodes */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Episodes</h2>
            {user?.is_podcaster && (
              <Button 
                onClick={() => router.push(`/podcast`)}
                className="btn-spotify"
              >
                <Plus className="w-4 h-4 mr-2" />
                Manage Episodes
              </Button>
            )}
          </div>

          {episodes.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="text-center py-12">
                <Mic className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Episodes</h3>
                <p className="text-gray-400 mb-4">This podcast doesn't have any episodes yet.</p>
                {user?.is_podcaster && (
                  <Button 
                    onClick={() => router.push(`/podcast`)}
                    className="btn-spotify"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Episode
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {episodes.map((episode, index) => (
                <Card key={episode.id_episode} className="bg-gray-900/50 border-gray-800 hover:border-green-500/50 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">{episode.judul}</h3>
                          <p className="text-gray-400 mb-3">{episode.deskripsi}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatDuration(episode.durasi)}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(episode.tanggal_rilis)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          className="btn-spotify"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Play
                        </Button>
                        {user?.is_podcaster && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                            onClick={() => handleDeleteEpisode(episode.id_episode)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 