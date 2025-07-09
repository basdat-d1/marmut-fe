"use client"

import { useEffect, useState } from 'react'
import { useAuth, useToast } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
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
  Edit,
  Trash2
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
  const { showToast } = useToast()
  const router = useRouter()
  const params = useParams()
  const playlistId = params.id as string
  
  const [playlistDetail, setPlaylistDetail] = useState<PlaylistDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [songToRemove, setSongToRemove] = useState<Song | null>(null)

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
      showToast('Failed to load playlist detail', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleShufflePlay = async () => {
    try {
      await playlistAPI.playPlaylist(playlistId)
      showToast('Playlist shuffle play started!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to play playlist', 'error')
    }
  }

  const handlePlaySong = async (songId: string) => {
    try {
      // This would typically call a play song API
      showToast('Song played successfully!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to play song', 'error')
    }
  }

  const handleRemoveSong = async (songId: string) => {
    try {
      await playlistAPI.removeSongFromPlaylist(playlistId, songId)
      await loadPlaylistDetail()
      showToast('Song removed from playlist successfully!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to remove song from playlist', 'error')
    }
  }

  const handleRemoveConfirm = async () => {
    if (songToRemove) {
      await handleRemoveSong(songToRemove.id)
      setSongToRemove(null)
    }
    setShowRemoveConfirm(false)
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
          <h1 className="text-2xl font-bold text-red-400 mb-4">Playlist Not Found</h1>
          <p className="text-gray-400 mb-4">The playlist you're looking for doesn't exist or has been removed.</p>
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

        {/* Playlist Information */}
        <Card className="mb-6 bg-gray-900/80 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2">
              <Music className="w-6 h-6 text-green-400" />
              {playlistDetail.playlist.judul}
            </CardTitle>
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
        <Card className="bg-gray-900/80 border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-green-400" />
                Daftar Lagu
              </CardTitle>
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
                            {playlistDetail.playlist.email_pembuat === user?.email && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                                onClick={() => {
                                  setSongToRemove(song)
                                  setShowRemoveConfirm(true)
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
          isOpen={showRemoveConfirm}
          onClose={() => {
            setShowRemoveConfirm(false)
            setSongToRemove(null)
          }}
          onConfirm={handleRemoveConfirm}
          title="Remove Song"
          message={`Are you sure you want to remove "${songToRemove?.judul}" from this playlist?`}
          type="delete"
          confirmText="Remove Song"
        />
      </div>
    </div>
  )
} 