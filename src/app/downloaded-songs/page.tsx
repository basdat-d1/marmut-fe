"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { downloadedSongsAPI } from '@/lib/api'
import { 
  Download, 
  Eye, 
  Trash2, 
  Music,
  Calendar,
  User,
  Search,
  Play,
  Clock,
  Disc
} from 'lucide-react'

interface DownloadedSong {
  id: string
  judul: string
  artist: string
  album: string
  durasi: number
  tanggal_download: string
}

export default function DownloadedSongsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [downloadedSongs, setDownloadedSongs] = useState<DownloadedSong[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSuccessMessage, setShowSuccessMessage] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    
    if (!user.is_premium) {
      router.push('/subscription')
      return
    }
    
    loadDownloadedSongs()
  }, [user, router])

  const loadDownloadedSongs = async () => {
    try {
      const data = await downloadedSongsAPI.getDownloadedSongs()
      setDownloadedSongs(data.songs || [])
    } catch (error) {
      console.error('Failed to load downloaded songs:', error)
      setError('Failed to load downloaded songs')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSong = async (songId: string, songTitle: string) => {
    if (!confirm('Are you sure you want to remove this song from your downloads?')) return

    try {
      await downloadedSongsAPI.removeDownloadedSong(songId)
      loadDownloadedSongs() // Refresh the list
      setShowSuccessMessage(`Berhasil menghapus Lagu dengan judul '${songTitle}' dari daftar unduhan!`)
      setTimeout(() => setShowSuccessMessage(''), 5000)
    } catch (error: any) {
      setError(error.message || 'Failed to delete downloaded song')
    }
  }

  const handleViewSong = (songId: string) => {
    router.push(`/song/${songId}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
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

  if (!user?.is_premium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Premium Feature</h1>
          <p className="text-gray-400 mb-6">Download feature is only available for premium users.</p>
          <Button 
            onClick={() => router.push('/subscription')}
            className="btn-spotify"
          >
            Upgrade to Premium
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Daftar Lagu</h1>
          <p className="text-gray-400">Manage your downloaded songs</p>
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

        {/* Downloaded Songs List */}
        {downloadedSongs.length === 0 ? (
          <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Download className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">No Downloaded Songs</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                You haven't downloaded any songs yet. Download your favorite tracks to listen offline!
              </p>
              <Button 
                onClick={() => router.push('/search')}
                className="btn-spotify px-8 py-3 text-lg"
              >
                <Search className="w-5 h-5 mr-2" />
                Discover Music
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Download Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-green-900/30 to-green-800/30 border-green-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                      <Download className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Downloads</p>
                      <p className="text-white font-bold text-xl">{downloadedSongs.length}</p>
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
                      <p className="text-gray-400 text-sm">Storage Used</p>
                      <p className="text-white font-bold text-xl">
                        {Math.round(downloadedSongs.reduce((sum, song) => sum + (song.durasi || 0), 0) / 60)} MB
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
                        {Math.round(downloadedSongs.reduce((sum, song) => sum + (song.durasi || 0), 0) / 60)} min
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Songs Table */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Download className="w-5 h-5 mr-2 text-green-400" />
                  Downloaded Songs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Song
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Artist
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Album
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {downloadedSongs.map((song) => (
                        <tr key={song.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center mr-3">
                                <Music className="w-5 h-5 text-green-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">{song.judul}</div>
                                <div className="text-sm text-gray-400">{song.album}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-300">{song.artist}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center">
                              <Disc className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-300">{song.album}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center">
                              <Clock className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-300">{song.durasi} min</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                            <div className="flex justify-center space-x-2">
                              <Button 
                                size="sm" 
                                className="btn-spotify"
                                onClick={() => router.push(`/song/${song.id}`)}
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Play
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                                onClick={() => handleDeleteSong(song.id, song.judul)}
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

        {/* Quick Actions */}
        {downloadedSongs.length > 0 && (
          <Card className="mt-6 bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Button 
                  onClick={() => router.push('/search')}
                  className="btn-spotify"
                >
                  <Music className="w-4 h-4 mr-2" />
                  Discover More Music
                </Button>
                <Button 
                  onClick={() => router.push('/playlist')}
                  variant="outline"
                  className="border-gray-700 text-white hover:bg-gray-800"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Manage Playlists
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 