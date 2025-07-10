"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { downloadedSongsAPI } from '@/lib/api'
import { Download, Music, Trash2, ArrowLeft, Eye } from 'lucide-react'

interface DownloadedSong {
  id: string
  judul: string
  artist: string
}

export default function DownloadedSongsPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const [songs, setSongs] = useState<DownloadedSong[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [songToDelete, setSongToDelete] = useState<DownloadedSong | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    if (!user.is_premium) {
      showToast('Only premium users can access downloaded songs', 'error')
      router.push('/')
      return
    }
    loadDownloadedSongs()
  }, [user, router])

  const loadDownloadedSongs = async () => {
    setLoading(true)
    try {
      const data = await downloadedSongsAPI.getDownloadedSongs()
      setSongs(data.songs || [])
    } catch (error: any) {
      if (error.message?.includes('premium')) {
        showToast('Only premium users can access downloaded songs', 'error')
        router.push('/')
      } else {
        showToast('Failed to load downloaded songs', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSong = async (songId: string) => {
    try {
      const response = await downloadedSongsAPI.removeDownloadedSong(songId)
      setSongs(prev => prev.filter(song => song.id !== songId))
      showToast(response.message || 'Song removed from downloads!', 'success')
    } catch (error) {
      showToast('Failed to remove song', 'error')
    }
  }

  const handleDeleteConfirm = async () => {
    if (songToDelete) {
      await handleRemoveSong(songToDelete.id)
      setSongToDelete(null)
    }
    setShowDeleteConfirm(false)
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading downloaded songs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
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

        <Card className="bg-gray-900/80 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-green-400" />
              Downloaded Songs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {songs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Download className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Belum Ada Lagu Diunduh</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">Anda belum mengunduh lagu apapun. Mulai unduh lagu favorit Anda!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Judul Lagu</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Oleh</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {songs.map((song) => (
                      <tr key={song.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center mr-3">
                              <Music className="w-5 h-5 text-green-400" />
                            </div>
                            <div className="text-sm font-medium text-white">{song.judul}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {song.artist}
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              className="btn-spotify"
                              onClick={() => router.push(`/song/${song.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Lihat
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-red-600 text-red-400 hover:bg-red-600/20"
                              onClick={() => {
                                setSongToDelete(song)
                                setShowDeleteConfirm(true)
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
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

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false)
            setSongToDelete(null)
          }}
          onConfirm={handleDeleteConfirm}
          title="Hapus Lagu dari Unduhan"
          message={`Apakah Anda yakin ingin menghapus lagu "${songToDelete?.judul}" dari daftar unduhan?`}
          type="delete"
          confirmText="Hapus"
        />
      </div>
    </div>
  )
} 