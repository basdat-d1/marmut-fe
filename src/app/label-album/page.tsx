"use client"

import { useEffect, useState } from 'react'
import { useAuth, useToast } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { albumAPI } from '@/lib/api'
import { 
  Music, 
  Search,
  Eye,
  Trash2
} from 'lucide-react'

interface Album {
  id: string
  judul: string
  jumlah_lagu: number
  total_durasi: number
  tanggal_rilis: string
  label: string
}

export default function LabelAlbumPage() {
  const { user, label } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const [albums, setAlbums] = useState<Album[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null)

  useEffect(() => {
    if (!user && !label) {
      return
    }
    
    if (!label) {
      return
    }
    
    loadAlbums()
  }, [user, label])

  const loadAlbums = async () => {
    try {
      const data = await albumAPI.getLabelAlbums()
      setAlbums(data.albums || [])
    } catch (error) {
      showToast('Failed to load albums', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAlbum = async (albumId: string) => {
    try {
      await albumAPI.deleteAlbum(albumId)
      await loadAlbums()
      showToast('Album deleted successfully!', 'success')
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Failed to delete album', 'error')
    }
  }

  const handleDeleteConfirm = async () => {
    if (albumToDelete) {
      await handleDeleteAlbum(albumToDelete.id)
      setAlbumToDelete(null)
    }
    setShowDeleteConfirm(false)
  }

  const handleViewSongs = (album: Album) => {
    router.push(`/label-album/${album.id}`)
  }

  const filteredAlbums = albums.filter(album =>
    album.judul.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDuration = (minutes: number) => {
    if (minutes < 1) return '0 min'

    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins} min`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
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
          <p className="mt-4 text-gray-400">Loading albums...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Label Albums</h1>
          <p className="text-gray-400">Albums published under your label</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search albums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
            />
          </div>
        </div>

        {/* Albums Table or Empty State */}
        {filteredAlbums.length === 0 ? (
          <Card className="bg-gray-900/80 border-0 shadow-md">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Music className="w-10 h-10 text-green-400" />
          </div>
              <h3 className="text-xl font-semibold text-white mb-3">No Albums Found</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {searchTerm ? 'Try adjusting your search terms' : 'No albums are published under your label yet'}
            </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-900/80 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Music className="w-5 h-5 mr-2 text-green-400" />
                Album List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Number of Songs</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
            {filteredAlbums.map((album) => (
                      <tr key={album.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{album.judul}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{album.jumlah_lagu}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{formatDuration(album.total_durasi)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-row items-center space-x-2">
                            <Button 
                              size="sm" 
                              className="w-10 h-10 rounded-full flex items-center justify-center mx-1" 
                              title="View Song List" 
                              onClick={() => handleViewSongs(album)}
                            >
                              <Eye className="w-6 h-6" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-10 h-10 rounded-full flex items-center justify-center mx-1 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent" 
                              title="Delete" 
                              onClick={() => { setAlbumToDelete(album); setShowDeleteConfirm(true); }}
                            >
                              <Trash2 className="w-6 h-6" />
                            </Button>
                </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                  </div>
                </CardContent>
              </Card>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false)
            setAlbumToDelete(null)
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Album"
          message={`Are you sure you want to delete "${albumToDelete?.judul}"? This action cannot be undone.`}
          type="delete"
          confirmText="Delete Album"
        />
      </div>
    </div>
  )
} 