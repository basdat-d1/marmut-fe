"use client"

import { useEffect, useState } from 'react'
import { useAuth, useToast } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { albumAPI } from '@/lib/api'
import { 
  ArrowLeft,
  Music, 
  Trash2,
  Eye
} from 'lucide-react'

interface Album {
  id: string
  judul: string
  label: string
  jumlah_lagu: number
  total_durasi: number
}

interface Song {
  id: string
  judul: string
  artist: string
  durasi: number
  total_play: number
  total_download: number
}

export default function LabelAlbumDetailPage() {
  const { user, label } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const params = useParams()
  const albumId = params.id as string
  
  const [album, setAlbum] = useState<Album | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    songId: string | null
    songTitle: string
  }>({
    isOpen: false,
    songId: null,
    songTitle: ''
  })

  useEffect(() => {
    if (!user && !label) {
      router.push('/')
      return
    }
    
    if (!label) {
      router.push('/dashboard')
      return
    }
    
    if (albumId) {
      loadAlbumData()
    }
  }, [user, label, router, albumId])

  const loadAlbumData = async () => {
    if (!albumId) return
    
    setLoading(true)
    try {
      const response = await albumAPI.getAlbumDetail(albumId)
      setAlbum(response.album)
      setSongs(response.songs || [])
    } catch (error) {
      showToast('Failed to load album data', 'error')
      router.push('/label-album')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSong = (songId: string, songTitle: string) => {
    setDeleteModal({
      isOpen: true,
      songId,
      songTitle
    })
  }

  const confirmDeleteSong = async () => {
    if (!deleteModal.songId) return
    
    try {
      await albumAPI.deleteSong(deleteModal.songId)
      await loadAlbumData() // Refresh the data
      showToast('Song deleted successfully!', 'success')
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Failed to delete song', 'error')
    }
  }

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      songId: null,
      songTitle: ''
    })
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  if (!label) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-400">Only labels can access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading album...</p>
        </div>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Album Not Found</h1>
          <p className="text-gray-400 mb-4">The album you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/label-album')} className="btn-spotify">
            Back to Albums
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{album.judul}</h1>
                <p className="text-gray-400">
                  {album.label}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Songs List */}
        <Card className="bg-gray-900/80 border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center">
                <Music className="w-5 h-5 mr-2 text-green-400" />
                Songs in this Album
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => router.push('/label-album')}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Albums
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {songs.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Music className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">No Songs Yet</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  This album doesn't have any songs yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Artist</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Play</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Download</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {songs.map((song) => (
                      <tr key={song.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{song.judul}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{song.artist}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{song.durasi} minutes</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{song.total_play}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{song.total_download}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                              onClick={() => router.push(`/song/${song.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Detail
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                              onClick={() => handleDeleteSong(song.id, song.judul)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteSong}
        title="Delete Song"
        message={`Are you sure you want to delete "${deleteModal.songTitle}"? This action cannot be undone.`}
        type="delete"
        confirmText="Delete Song"
      />
    </div>
  )
} 