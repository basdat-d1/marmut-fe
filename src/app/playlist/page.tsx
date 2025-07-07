"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { playlistAPI } from '@/lib/api'
import { 
  Plus, 
  Play, 
  Edit, 
  Trash2, 
  Music, 
  Clock,
} from 'lucide-react'

interface Playlist {
  id_user_playlist: string
  judul: string
  deskripsi: string
  jumlah_lagu: number
  total_durasi: number
  tanggal_dibuat: string
  email_pembuat: string
}

export default function PlaylistPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({
    judul: '',
    deskripsi: ''
  })
  const [error, setError] = useState('')

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
      console.error('Failed to load playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await playlistAPI.createPlaylist(createForm)
      setCreateForm({ judul: '', deskripsi: '' })
      setShowCreateForm(false)
      loadPlaylists()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create playlist')
    }
  }

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return

    try {
      await playlistAPI.deletePlaylist(playlistId)
      loadPlaylists()
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete playlist')
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} menit`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours} jam ${remainingMinutes} menit`
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading playlists...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Playlists</h1>
            <p className="text-gray-600">Manage your music collections</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Playlist
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Create Playlist Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Playlist</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Playlist Title
                </label>
                <Input
                  type="text"
                  placeholder="Enter playlist title"
                  value={createForm.judul}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, judul: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Input
                  type="text"
                  placeholder="Enter playlist description"
                  value={createForm.deskripsi}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, deskripsi: e.target.value }))}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit">
                  Create Playlist
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
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
        <Card>
          <CardContent className="text-center py-12">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Playlists Yet</h3>
            <p className="text-gray-600 mb-4">You haven't created any playlists yet.</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Playlist
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <Card key={playlist.id_user_playlist} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{playlist.judul}</CardTitle>
                <p className="text-sm text-gray-600">{playlist.deskripsi}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Music className="w-4 h-4 mr-1" />
                      {playlist.jumlah_lagu} songs
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDuration(playlist.total_durasi)}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Created: {formatDate(playlist.tanggal_dibuat)}
                  </p>
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/playlist/${playlist.id_user_playlist}`)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => router.push(`/playlist/${playlist.id_user_playlist}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeletePlaylist(playlist.id_user_playlist)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 