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
      await playlistAPI.playSongFromPlaylist(playlistId, songId)
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
            Back
          </Button>
        </div>

        {/* Playlist Information and Songs - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Playlist Information */}
          <Card className="bg-gray-900/80 border-0 shadow-md relative">
          <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white text-2xl flex items-center gap-2 mb-2">
              <Music className="w-6 h-6 text-green-400" />
              {playlistDetail.playlist.judul}
            </CardTitle>
                  <p className="text-gray-400 text-sm">{playlistDetail.playlist.deskripsi}</p>
            </div>
              {playlistDetail.playlist.email_pembuat === user?.email && (
                <Button 
                  onClick={() => router.push(`/playlist/${playlistId}/edit`)}
                  variant="outline"
                    size="sm"
                    className="border-gray-700 text-white hover:bg-gray-800 ml-4"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Playlist
                </Button>
              )}
            </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Playlist Details - Vertical Layout */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="text-gray-400 text-sm">Creator</span>
                    <p className="text-white font-medium">{playlistDetail.playlist.email_pembuat}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Music className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="text-gray-400 text-sm">Number of Songs</span>
                    <p className="text-white font-medium">{playlistDetail.playlist.jumlah_lagu} songs</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="text-gray-400 text-sm">Total Duration</span>
                    <p className="text-white font-medium">{playlistDetail.playlist.total_durasi}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="text-gray-400 text-sm">Created Date</span>
                    <p className="text-white font-medium">{formatDate(playlistDetail.playlist.tanggal_dibuat)}</p>
                  </div>
                </div>
              </div>
              
              {/* Shuffle Play Button - Centered */}
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleShufflePlay}
                  className="btn-spotify px-8 py-3 text-lg"
                  size="lg"
                >
                  <Shuffle className="w-5 h-5 mr-3" />
                  Shuffle Play
                </Button>
              </div>
          </CardContent>
        </Card>

          {/* Right Column - Songs List */}
        <Card className="bg-gray-900/80 border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-green-400" />
                Song List
              </CardTitle>
              {playlistDetail.playlist.email_pembuat === user?.email && (
                <Button 
                  onClick={() => router.push(`/playlist/${playlistId}/add-song`)}
                  className="btn-spotify"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Song
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {playlistDetail.songs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Music className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">No Songs Yet</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">This playlist doesn't have any songs yet. Start adding your favorite songs!</p>
                  {playlistDetail.playlist.email_pembuat === user?.email && (
                    <Button 
                      onClick={() => router.push(`/playlist/${playlistId}/add-song`)}
                      className="btn-spotify px-8 py-3 text-lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add First Song
                    </Button>
                  )}
                </div>
            ) : (
                <div className="overflow-y-auto max-h-96">
                  <div className="space-y-2">
                    {playlistDetail.songs.map((song, index) => (
                      <div key={song.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center text-xs font-medium text-green-400">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">{song.judul}</div>
                            <div className="text-xs text-gray-400 truncate">{song.artist} • {song.album}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className="text-xs text-gray-400 mr-12">{song.durasi}</span>
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
                              View
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
                      </div>
                    ))}
                  </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>

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