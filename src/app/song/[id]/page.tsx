"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { songAPI, playlistAPI } from '@/lib/api'
import { 
  Play, 
  Download, 
  Plus, 
  ArrowLeft,
  Music,
  User,
  Calendar,
  Clock,
  Album,
  Tag,
  Volume2
} from 'lucide-react'

interface Song {
  id: string
  judul: string
  genres: string[]
  artist: string
  songwriters: string[]
  durasi: string
  tanggal_rilis: string
  tahun: number
  total_play: number
  total_download: number
  album: string
}

interface Playlist {
  id: string
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
  const [playProgress, setPlayProgress] = useState(0)
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState('')
  const [showSuccessMessage, setShowSuccessMessage] = useState('')
  const [error, setError] = useState('')
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false)
  const [showAddToPlaylistConfirm, setShowAddToPlaylistConfirm] = useState(false)

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
      setError('Failed to load song data')
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = async () => {
    if (playProgress < 70) {
      alert('You need to listen to at least 70% of the song to count as a play')
      return
    }

    try {
      await songAPI.playSong(songId, playProgress)
      // Refresh song data to update total plays
      loadSongData()
      setShowSuccessMessage('Song played successfully!')
      setTimeout(() => setShowSuccessMessage(''), 3000)
    } catch (error: any) {
      setError(error.message || 'Failed to play song')
    }
  }

  const handleAddToPlaylist = async () => {
    if (!selectedPlaylist) {
      alert('Please select a playlist')
      return
    }

    try {
      await playlistAPI.addSongToPlaylist(selectedPlaylist, songId)
      setShowAddToPlaylist(false)
      setSelectedPlaylist('')
      setShowSuccessMessage(`Berhasil menambahkan Lagu dengan judul '${song?.judul}' ke '${playlists.find(p => p.id === selectedPlaylist)?.judul}'!`)
      setTimeout(() => setShowSuccessMessage(''), 5000)
    } catch (error: any) {
      if (error.message?.includes('already')) {
        setShowSuccessMessage(`Lagu dengan judul '${song?.judul}' sudah ditambahkan di '${playlists.find(p => p.id === selectedPlaylist)?.judul}'!`)
      } else {
        setError(error.message || 'Failed to add song to playlist')
      }
      setTimeout(() => setShowSuccessMessage(''), 5000)
    }
  }

  const handleAddToPlaylistConfirm = async () => {
    if (!selectedPlaylist) {
      alert('Please select a playlist')
      return
    }

    try {
      await playlistAPI.addSongToPlaylist(selectedPlaylist, songId)
      setShowAddToPlaylist(false)
      setSelectedPlaylist('')
      setShowSuccessMessage(`Berhasil menambahkan Lagu dengan judul '${song?.judul}' ke '${playlists.find(p => p.id === selectedPlaylist)?.judul}'!`)
      setTimeout(() => setShowSuccessMessage(''), 5000)
    } catch (error: any) {
      if (error.message?.includes('already')) {
        setShowSuccessMessage(`Lagu dengan judul '${song?.judul}' sudah ditambahkan di '${playlists.find(p => p.id === selectedPlaylist)?.judul}'!`)
      } else {
        setError(error.message || 'Failed to add song to playlist')
      }
      setTimeout(() => setShowSuccessMessage(''), 5000)
    }
  }

  const handleDownload = async () => {
    if (!user?.is_premium) {
      alert('Download feature is only available for premium users')
      return
    }

    try {
      await songAPI.downloadSong(songId)
      // Refresh song data to update total downloads
      loadSongData()
      setShowSuccessMessage(`Berhasil mengunduh Lagu dengan judul '${song?.judul}'!`)
      setTimeout(() => setShowSuccessMessage(''), 5000)
    } catch (error: any) {
      if (error.message?.includes('already')) {
        setShowSuccessMessage(`Lagu dengan judul '${song?.judul}' sudah pernah di unduh!`)
      } else {
        setError(error.message || 'Failed to download song')
      }
      setTimeout(() => setShowSuccessMessage(''), 5000)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
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
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-gray-400 mb-4">{error || 'Song not found'}</p>
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
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="text-white hover:bg-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {showSuccessMessage && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
            <p className="text-green-200">{showSuccessMessage}</p>
          </div>
        )}

        {/* Song Information */}
        <Card className="mb-6 bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-2xl">{song.judul}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Genre(s):</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {song.genres.map((genre, index) => (
                    <span key={index} className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Artist:</label>
                <p className="text-white">{song.artist}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Songwriter(s):</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {song.songwriters && song.songwriters.length > 0 ? (
                    song.songwriters.map((songwriter, index) => (
                      <span key={index} className="text-white">{songwriter}{index < song.songwriters.length - 1 ? ', ' : ''}</span>
                    ))
                  ) : (
                    <span className="text-gray-500">No songwriters listed</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Durasi:</label>
                <p className="text-white">{song.durasi}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Tanggal Rilis:</label>
                <p className="text-white">{formatDate(song.tanggal_rilis)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Tahun:</label>
                <p className="text-white">{song.tahun}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Total Play:</label>
                <p className="text-white">{song.total_play}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Total Downloads:</label>
                <p className="text-white">{song.total_download}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Album:</label>
                <p className="text-white">{song.album}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audio Player */}
        <Card className="mb-6 bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Audio Player</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Progress: {playProgress}%</label>
              <div className="relative">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${playProgress}%` }}
                  ></div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={playProgress}
                  onChange={(e) => setPlayProgress(Number(e.target.value))}
                  className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex space-x-4">
              <Button 
                onClick={handlePlay}
                className="btn-spotify"
                disabled={playProgress < 70}
              >
                <Play className="w-4 h-4 mr-2" />
                Play
              </Button>
              <Button 
                onClick={() => setShowAddToPlaylist(true)}
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Playlist
              </Button>
              {user?.is_premium && (
                <Button 
                  onClick={() => setShowDownloadConfirm(true)}
                  variant="outline"
                  className="border-gray-700 text-white hover:bg-gray-800"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add to Playlist Modal */}
        {showAddToPlaylist && (
          <Card className="mb-6 bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Add Song to User Playlist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white">Judul: {song.judul}</label>
              </div>
              <div>
                <label className="text-sm font-medium text-white">Artist: {song.artist}</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Playlist *
                </label>
                <select
                  value={selectedPlaylist}
                  onChange={(e) => setSelectedPlaylist(e.target.value)}
                  required
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:ring-green-500"
                >
                  <option value="" className="bg-gray-800">Pilih playlist</option>
                  {playlists.map((playlist) => (
                    <option key={playlist.id} value={playlist.id} className="bg-gray-800">
                      {playlist.judul}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setShowAddToPlaylistConfirm(true)}
                  className="btn-spotify"
                  disabled={!selectedPlaylist}
                >
                  Tambah
                </Button>
                <Button 
                  onClick={() => {
                    setShowAddToPlaylist(false)
                    setSelectedPlaylist('')
                  }}
                  variant="outline"
                  className="border-gray-700 text-white hover:bg-gray-800"
                >
                  Kembali
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Modals */}
        <ConfirmationModal
          isOpen={showDownloadConfirm}
          onClose={() => setShowDownloadConfirm(false)}
          onConfirm={handleDownload}
          title="Download Song"
          message={`Are you sure you want to download "${song?.judul}" by ${song?.artist}?`}
          type="download"
          confirmText="Download"
        />

        <ConfirmationModal
          isOpen={showAddToPlaylistConfirm}
          onClose={() => setShowAddToPlaylistConfirm(false)}
          onConfirm={handleAddToPlaylistConfirm}
          title="Add to Playlist"
          message={`Are you sure you want to add "${song?.judul}" to "${playlists.find(p => p.id === selectedPlaylist)?.judul}"?`}
          type="add"
          confirmText="Add to Playlist"
        />
      </div>
    </div>
  )
} 