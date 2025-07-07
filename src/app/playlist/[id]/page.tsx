"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { playlistAPI, songAPI } from '@/lib/api'
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Music,
  Trash2,
  Download,
  Plus,
  Calendar
} from 'lucide-react'

interface Playlist {
  id_user_playlist: string
  judul: string
  deskripsi: string
  jumlah_lagu: number
  total_durasi: number
  tanggal_dibuat: string
  email_pembuat: string
  songs: PlaylistSong[]
}

interface PlaylistSong {
  id_konten: string
  judul: string
  durasi: number
  tanggal_rilis: string
  tahun: number
  artist: string
  album: string
  genres: string[]
}

export default function PlaylistDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const playlistId = params.id as string

  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentSong, setCurrentSong] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [processingDownload, setProcessingDownload] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    loadPlaylistData()
  }, [user, router, playlistId])

  const loadPlaylistData = async () => {
    try {
      const data = await playlistAPI.getPlaylistSongs(playlistId)
      setPlaylist(data)
    } catch (error) {
      console.error('Failed to load playlist data:', error)
      setError('Failed to load playlist information')
    } finally {
      setLoading(false)
    }
  }

  const handlePlayPlaylist = async () => {
    if (!playlist) return

    try {
      await playlistAPI.playPlaylist(playlistId, playlist.email_pembuat)
      setCurrentSong(playlist.songs[0]?.id_konten || null)
      setIsPlaying(true)
    } catch (error: any) {
      setError(error.message || 'Failed to play playlist')
    }
  }

  const handlePlaySong = async (songId: string) => {
    try {
      await songAPI.playSong(songId, 0)
      setCurrentSong(songId)
      setIsPlaying(true)
    } catch (error: any) {
      setError(error.message || 'Failed to play song')
    }
  }

  const handleRemoveSong = async (songId: string) => {
    if (!confirm('Are you sure you want to remove this song from the playlist?')) return

    try {
      await playlistAPI.removeSongFromPlaylist(playlistId, songId)
      loadPlaylistData() // Reload to get updated data
    } catch (error: any) {
      setError(error.message || 'Failed to remove song')
    }
  }

  const handleDownloadSong = async (songId: string) => {
    if (!user?.is_premium) {
      alert('Download feature is only available for premium users')
      return
    }

    setProcessingDownload(songId)
    try {
      await songAPI.downloadSong(songId)
      alert('Song downloaded successfully!')
    } catch (error: any) {
      setError(error.message || 'Failed to download song')
    } finally {
      setProcessingDownload(null)
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
          <p className="mt-4 text-gray-400">Loading playlist...</p>
        </div>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="text-center py-12">
            <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Playlist Not Found</h3>
            <p className="text-gray-400 mb-4">The playlist you're looking for doesn't exist.</p>
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

        {/* Playlist Information */}
        <Card className="mb-6 bg-gray-900/50 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-white">{playlist.judul}</CardTitle>
                <p className="text-gray-400 mt-2">{playlist.deskripsi}</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handlePlayPlaylist}
                  className="btn-spotify"
                  disabled={playlist.songs.length === 0}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play All
                </Button>
                <Button 
                  onClick={() => router.push(`/playlist`)}
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Music className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Songs</p>
                  <p className="font-medium text-white">{playlist.jumlah_lagu}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Duration</p>
                  <p className="font-medium text-white">{formatDuration(playlist.total_durasi)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Created</p>
                  <p className="font-medium text-white">{formatDate(playlist.tanggal_dibuat)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Songs List */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Songs</CardTitle>
          </CardHeader>
          <CardContent>
            {playlist.songs.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Songs</h3>
                <p className="text-gray-400 mb-4">This playlist doesn't have any songs yet.</p>
                <Button 
                  onClick={() => router.push(`/playlist`)}
                  className="btn-spotify"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Songs
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {playlist.songs.map((song, index) => (
                  <div 
                    key={song.id_konten} 
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium text-gray-300">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{song.judul}</h3>
                        <p className="text-sm text-gray-400">{song.artist} • {song.album}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {song.genres.map((genre, idx) => (
                            <span key={idx} className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-400">
                        {formatDuration(song.durasi)}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-gray-600 text-white hover:bg-gray-800"
                        onClick={() => handlePlaySong(song.id_konten)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      {user?.is_premium && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-gray-600 text-white hover:bg-gray-800"
                          onClick={() => handleDownloadSong(song.id_konten)}
                          disabled={processingDownload === song.id_konten}
                        >
                          {processingDownload === song.id_konten ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        onClick={() => handleRemoveSong(song.id_konten)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audio Player Placeholder */}
        {currentSong && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-800 p-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  size="sm" 
                  className="btn-spotify"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </Button>
                <div>
                  <p className="font-medium text-white">Now Playing</p>
                  <p className="text-sm text-gray-400">
                    {playlist.songs.find(s => s.id_konten === currentSong)?.judul}
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800"
                onClick={() => {
                  setCurrentSong(null)
                  setIsPlaying(false)
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 