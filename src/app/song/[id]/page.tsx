"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { songAPI, playlistAPI } from '@/lib/api'
import { 
  Play, 
  Download, 
  Plus, 
  ArrowLeft,
  Music,
  Clock,
  Calendar,
  User,
  Album
} from 'lucide-react'

interface Song {
  id_konten: string
  judul: string
  durasi: number
  tanggal_rilis: string
  tahun: number
  total_play: number
  total_download: number
  artist: string
  album: string
  genres: string[]
  songwriters: string[]
}

interface Playlist {
  id_user_playlist: string
  judul: string
}

export default function SongDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const songId = params.id as string

  const [song, setSong] = useState<Song | null>(null)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState('')
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    loadSongData()
  }, [user, router, songId])

  const loadSongData = async () => {
    try {
      const [songData, playlistsData] = await Promise.all([
        songAPI.getSong(songId),
        playlistAPI.getUserPlaylists()
      ])
      setSong(songData.song)
      setPlaylists(playlistsData.playlists || [])
    } catch (error) {
      console.error('Failed to load song data:', error)
      setError('Failed to load song information')
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = async () => {
    if (!isPlaying) {
      setIsPlaying(true)
      // Simulate progress
      let currentProgress = 0
      const interval = setInterval(() => {
        currentProgress += 10
        setProgress(currentProgress)
        if (currentProgress >= 100) {
          clearInterval(interval)
          setIsPlaying(false)
        }
      }, 1000)
    }

    try {
      await songAPI.playSong(songId, progress)
      setMessage('Song played successfully!')
      if (song) {
        setSong(prev => prev ? { ...prev, total_play: prev.total_play + 1 } : null)
      }
    } catch (error: any) {
      setError(error.message || 'Failed to play song')
    }
  }

  const handleDownload = async () => {
    if (!user?.is_premium) {
      setError('Premium subscription required to download songs')
      return
    }

    try {
      await songAPI.downloadSong(songId)
      setMessage('Song downloaded successfully!')
      if (song) {
        setSong(prev => prev ? { ...prev, total_download: prev.total_download + 1 } : null)
      }
    } catch (error: any) {
      setError(error.message || 'Failed to download song')
    }
  }

  const handleAddToPlaylist = async () => {
    if (!selectedPlaylist) return

    setProcessing(true)
    try {
      await playlistAPI.addSongToPlaylist(selectedPlaylist, songId)
      setMessage(`Successfully added '${song?.judul}' to playlist!`)
      setShowAddToPlaylist(false)
      setSelectedPlaylist('')
    } catch (error: any) {
      setError(error.message || 'Failed to add song to playlist')
    } finally {
      setProcessing(false)
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
          <p className="mt-4 text-gray-400">Loading song...</p>
        </div>
      </div>
    )
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="text-center py-12">
            <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Song Not Found</h3>
            <p className="text-gray-400 mb-4">The song you're looking for doesn't exist.</p>
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

        {message && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
            <p className="text-green-200">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl text-white">{song.judul}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Song Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-400">Artist</p>
                    <p className="font-medium text-white">{song.artist}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Album className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-400">Album</p>
                    <p className="font-medium text-white">{song.album}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="font-medium text-white">{formatDuration(song.durasi)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-400">Release Date</p>
                    <p className="font-medium text-white">{formatDate(song.tanggal_rilis)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Genres</p>
                  <div className="flex flex-wrap gap-2">
                    {song.genres.map((genre, index) => (
                      <span key={index} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">Songwriters</p>
                  <div className="flex flex-wrap gap-2">
                    {song.songwriters.map((writer, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                        {writer}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Total Plays</p>
                    <p className="font-medium text-white">{song.total_play.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Downloads</p>
                    <p className="font-medium text-white">{song.total_download.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {isPlaying && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Playing...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={handlePlay}
                className="btn-spotify"
                disabled={isPlaying}
              >
                <Play className="w-4 h-4 mr-2" />
                {isPlaying ? 'Playing...' : 'Play'}
              </Button>

              {user?.is_premium && (
                <Button 
                  onClick={handleDownload}
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}

              <Button 
                onClick={() => setShowAddToPlaylist(true)}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Playlist
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add to Playlist Modal */}
        {showAddToPlaylist && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md bg-gray-900/95 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Add to Playlist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Select a playlist:</p>
                  <select 
                    value={selectedPlaylist}
                    onChange={(e) => setSelectedPlaylist(e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="">Choose playlist...</option>
                    {playlists.map(playlist => (
                      <option key={playlist.id_user_playlist} value={playlist.id_user_playlist}>
                        {playlist.judul}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleAddToPlaylist}
                    disabled={!selectedPlaylist || processing}
                    className="btn-spotify flex-1"
                  >
                    {processing ? 'Adding...' : 'Add'}
                  </Button>
                  <Button 
                    onClick={() => setShowAddToPlaylist(false)}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 