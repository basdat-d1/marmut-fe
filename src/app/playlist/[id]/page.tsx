"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { playlistAPI } from '@/lib/api'
import { 
  Play, 
  Plus, 
  ArrowLeft,
  Music,
  Clock,
  User,
  Calendar,
  Shuffle,
  Edit
} from 'lucide-react'

interface Song {
  id: string
  judul: string
  artist: string
  album: string
  durasi: string
}

interface PlaylistDetail {
  playlist: {
    id: string
    judul: string
    deskripsi: string
    jumlah_lagu: number
    total_durasi: string
    tanggal_dibuat: string
    email_pembuat: string
  }
  songs: Song[]
}

export default function PlaylistDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const playlistId = params.id as string
  
  const [playlistDetail, setPlaylistDetail] = useState<PlaylistDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    loadPlaylistDetail()
  }, [user, router, playlistId])

  const loadPlaylistDetail = async () => {
    try {
      const data = await playlistAPI.getPlaylistDetail(playlistId)
      setPlaylistDetail(data)
    } catch (error) {
      console.error('Failed to load playlist detail:', error)
      setError('Failed to load playlist detail')
    } finally {
      setLoading(false)
    }
  }

  const handleShufflePlay = async () => {
    try {
      await playlistAPI.playPlaylist(playlistId)
      // Show success message or update UI
    } catch (error: any) {
      setError(error.message || 'Failed to play playlist')
    }
  }

  const handlePlaySong = async (songId: string) => {
    try {
      // This would typically call a play song API
      console.log('Playing song:', songId)
    } catch (error: any) {
      setError(error.message || 'Failed to play song')
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
          <p className="mt-4 text-gray-400">Loading playlist...</p>
        </div>
      </div>
    )
  }

  if (!playlistDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-gray-400 mb-4">{error || 'Playlist not found'}</p>
          <Button 
            onClick={() => router.push('/playlist')}
            className="btn-spotify"
          >
            Back to Playlists
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/playlist')}
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

        {/* Playlist Information */}
        <Card className="mb-6 bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-2xl">{playlistDetail.playlist.judul}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Pembuat:</span>
                <span className="text-white">{playlistDetail.playlist.email_pembuat}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Music className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Jumlah Lagu:</span>
                <span className="text-white">{playlistDetail.playlist.jumlah_lagu}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Total Durasi:</span>
                <span className="text-white">{playlistDetail.playlist.total_durasi}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Tanggal Dibuat:</span>
                <span className="text-white">{formatDate(playlistDetail.playlist.tanggal_dibuat)}</span>
              </div>
            </div>
            <div>
              <p className="text-gray-400">{playlistDetail.playlist.deskripsi}</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleShufflePlay}
                className="btn-spotify"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Shuffle Play
              </Button>
              {playlistDetail.playlist.email_pembuat === user?.email && (
                <Button 
                  onClick={() => router.push(`/playlist/${playlistId}/edit`)}
                  variant="outline"
                  className="border-gray-700 text-white hover:bg-gray-800"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Playlist
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Songs List */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Daftar Lagu</CardTitle>
              <Button 
                onClick={() => router.push(`/playlist/${playlistId}/add-song`)}
                className="btn-spotify"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Lagu
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {playlistDetail.songs.length === 0 ? (
              <div className="text-center py-8">
                <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Songs Yet</h3>
                <p className="text-gray-400 mb-4">This playlist doesn't have any songs yet.</p>
                <Button 
                  onClick={() => router.push(`/playlist/${playlistId}/add-song`)}
                  className="btn-spotify"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Song
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Judul Lagu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Oleh
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Durasi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {playlistDetail.songs.map((song) => (
                      <tr key={song.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{song.judul}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {song.artist}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {song.durasi}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              className="btn-spotify"
                              onClick={() => handlePlaySong(song.id)}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-gray-700 text-white hover:bg-gray-800"
                              onClick={() => router.push(`/song/${song.id}`)}
                            >
                              Lihat
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-gray-700 text-white hover:bg-gray-800"
                              onClick={() => {
                                // Handle remove song from playlist
                                if (confirm('Are you sure you want to remove this song from the playlist?')) {
                                  // Call remove song API
                                }
                              }}
                            >
                              Hapus
                            </Button>
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
      </div>
    </div>
  )
} 