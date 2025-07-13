"use client"

import { useEffect, useState } from 'react'
import { useAuth, useToast } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { playlistAPI } from '@/lib/api'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Music, 
  Clock,
  Library,
  Eye
} from 'lucide-react'

interface Playlist {
  id: string
  judul: string
  deskripsi: string
  jumlah_lagu: number
  total_durasi: string
  tanggal_dibuat: string
}

export default function PlaylistPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({
    judul: '',
    deskripsi: ''
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    loadPlaylists()
  }, [user, router])

  const loadPlaylists = async () => {
    try {
      const data = await playlistAPI.getUserPlaylists()
      setPlaylists(data.playlists || [])
    } catch (error) {
      showToast('Failed to load playlists', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await playlistAPI.createPlaylist(createForm)
      setCreateForm({ judul: '', deskripsi: '' })
      setShowCreateForm(false)
      await loadPlaylists()
      showToast('Playlist created successfully!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to create playlist', 'error')
    }
  }

  const handleDeletePlaylist = async (playlistId: string) => {
    try {
      await playlistAPI.deletePlaylist(playlistId)
      await loadPlaylists()
      showToast('Playlist deleted successfully!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to delete playlist', 'error')
    }
  }

  const handleDeleteConfirm = async () => {
    if (playlistToDelete) {
      await handleDeletePlaylist(playlistToDelete.id)
      setPlaylistToDelete(null)
    }
    setShowDeleteConfirm(false)
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
          <p className="mt-4 text-gray-400">Loading playlists...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">User Playlist</h1>
              <p className="text-gray-400">Manage your music collections</p>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="btn-spotify"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Playlist
            </Button>
          </div>
        </div>

        {/* Create Playlist Form */}
        {showCreateForm && (
          <Card className="mb-6 bg-gray-900/80 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-400" />
                Add Playlist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePlaylist} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Title
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter playlist title"
                    value={createForm.judul}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, judul: e.target.value }))}
                    required
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter playlist description"
                    value={createForm.deskripsi}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, deskripsi: e.target.value }))}
                    required
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="btn-spotify">
                    Submit
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="border-gray-700 text-white hover:bg-gray-800"
                    onClick={() => {
                      setShowCreateForm(false)
                      setCreateForm({ judul: '', deskripsi: '' })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Playlists List */}
        {playlists.length === 0 ? (
          <Card className="bg-gray-900/80 border-0 shadow-md">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Library className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">You Don't Have Any Playlists Yet</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">Start creating your first playlist to organize your favorite music</p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="btn-spotify px-8 py-3 text-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create First Playlist
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Playlist Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-green-900/30 to-green-800/30 border-green-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                      <Library className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Playlists</p>
                      <p className="text-white font-bold text-xl">{playlists.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-blue-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                      <Music className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Songs</p>
                      <p className="text-white font-bold text-xl">
                        {playlists.reduce((sum, playlist) => sum + playlist.jumlah_lagu, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Duration</p>
                      <p className="text-white font-bold text-xl">
                        {playlists.reduce((sum, playlist) => {
                          const duration = parseInt(playlist.total_durasi) || 0
                          return sum + duration
                        }, 0)} min
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Playlists Table */}
            <Card className="bg-gray-900/80 border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Library className="w-5 h-5 mr-2 text-green-400" />
                  Your Playlists
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Playlist
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Songs
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {playlists.map((playlist) => (
                        <tr key={playlist.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center mr-3">
                                <Music className="w-5 h-5 text-green-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">{playlist.judul}</div>
                                <div className="text-sm text-gray-400">{playlist.deskripsi}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Music className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-300">{playlist.jumlah_lagu} songs</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-300">{playlist.total_durasi}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                className="btn-spotify"
                                onClick={() => router.push(`/playlist/${playlist.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Detail
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-gray-700 text-white hover:bg-gray-800"
                                onClick={() => router.push(`/playlist/${playlist.id}/edit`)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                                onClick={() => {
                                  setPlaylistToDelete(playlist)
                                  setShowDeleteConfirm(true)
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
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
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false)
            setPlaylistToDelete(null)
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Playlist"
          message={`Are you sure you want to delete "${playlistToDelete?.judul}"? This action cannot be undone.`}
          type="delete"
          confirmText="Delete Playlist"
        />
      </div>
    </div>
  )
} 