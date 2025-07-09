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
  Plus, 
  Music, 
  Clock, 
  Calendar,
  Trash2,
  PlusCircle
} from 'lucide-react'

interface Album {
  id: string
  judul: string
  label: string
  jumlah_lagu: number
  total_durasi: number
  tanggal_rilis: string
  songs: Song[]
}

interface Song {
  id: string
  judul: string
  durasi: number
  tanggal_rilis: string
  total_play: number
  total_download: number
}

export default function AlbumPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showSongForm, setShowSongForm] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [createForm, setCreateForm] = useState({
    judul: '',
    label: ''
  })
  const [songForm, setSongForm] = useState({
    judul: '',
    durasi: 0
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    
    if (!user.is_artist && !user.is_songwriter) {
      router.push('/dashboard')
      return
    }
    
    loadAlbums()
  }, [user, router])

  const loadAlbums = async () => {
    try {
      const data = await albumAPI.getUserAlbums()
      setAlbums(data.albums || [])
    } catch (error) {
      showToast('Failed to load albums', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await albumAPI.createAlbum(createForm)
      setCreateForm({ judul: '', label: '' })
      setShowCreateForm(false)
      await loadAlbums()
      showToast('Album created successfully!', 'success')
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Failed to create album', 'error')
    }
  }

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAlbum) return

    try {
      await albumAPI.addSong(selectedAlbum.id, songForm)
      setSongForm({ judul: '', durasi: 0 })
      setShowSongForm(false)
      setSelectedAlbum(null)
      await loadAlbums()
      showToast('Song added successfully!', 'success')
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Failed to add song', 'error')
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

  if (!user?.is_artist && !user?.is_songwriter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-400">Only artists and songwriters can access this page.</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Albums</h1>
              <p className="text-gray-400">Manage your album content</p>
            </div>
            <Button 
              className="btn-spotify"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Album
            </Button>
          </div>
        </div>

        {/* Create Album Form */}
        {showCreateForm && (
          <Card className="mb-6 bg-gray-900/80 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-400" />
                Create New Album
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAlbum} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Album Title
                  </label>
                  <Input
                    type="text"
                    value={createForm.judul}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, judul: e.target.value }))}
                    placeholder="Enter album title"
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Label
                  </label>
                  <Input
                    type="text"
                    value={createForm.label}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="Enter label name"
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                    required
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="btn-spotify">
                    Create Album
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-800"
                    onClick={() => {
                      setShowCreateForm(false)
                      setCreateForm({ judul: '', label: '' })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Add Song Form */}
        {showSongForm && selectedAlbum && (
          <Card className="mb-6 bg-gray-900/80 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-green-400" />
                Add Song to &ldquo;{selectedAlbum.judul}&rdquo;
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSong} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Song Title
                  </label>
                  <Input
                    type="text"
                    value={songForm.judul}
                    onChange={(e) => setSongForm(prev => ({ ...prev, judul: e.target.value }))}
                    placeholder="Enter song title"
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={songForm.durasi}
                    onChange={(e) => setSongForm(prev => ({ ...prev, durasi: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter duration in minutes"
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                    min="1"
                    required
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="btn-spotify">
                    Add Song
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-800"
                    onClick={() => {
                      setShowSongForm(false)
                      setSongForm({ judul: '', durasi: 0 })
                      setSelectedAlbum(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Albums List */}
        {albums.length === 0 ? (
          <Card className="bg-gray-900/80 border-0 shadow-md">
            <CardContent className="text-center py-12">
              <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Albums Yet</h3>
              <p className="text-gray-400 mb-4">You haven&apos;t created any albums yet.</p>
              <Button 
                className="btn-spotify"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Album
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <Card key={album.id} className="bg-gray-900/80 border-0 shadow-md hover:border-green-500/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{album.judul}</h3>
                      <p className="text-sm text-gray-400 mb-2">{album.label}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Music className="w-4 h-4 mr-1" />
                          {album.jumlah_lagu} songs
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDuration(album.total_durasi)}
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(album.tanggal_rilis)}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="btn-spotify text-sm"
                      onClick={() => {
                        setSelectedAlbum(album)
                        setShowSongForm(true)
                      }}
                    >
                      <PlusCircle className="w-4 h-4 mr-1" />
                      Add Song
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-gray-600 text-white hover:bg-gray-800"
                      onClick={() => {
                        setAlbumToDelete(album)
                        setShowDeleteConfirm(true)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Songs List */}
                  {album.songs && album.songs.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h4 className="text-sm font-medium text-white mb-2">Songs:</h4>
                      <div className="space-y-2">
                        {album.songs.map((song) => (
                          <div key={song.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">{song.judul}</span>
                            <span className="text-gray-400">{formatDuration(song.durasi)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
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