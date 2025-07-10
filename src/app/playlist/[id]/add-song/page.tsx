"use client"

import { useEffect, useState } from 'react'
import { useAuth, useToast } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { playlistAPI, songAPI } from '@/lib/api'
import { 
  ArrowLeft,
  Search,
  Plus,
  Music,
  User,
  Disc
} from 'lucide-react'

interface Song {
  id: string
  judul: string
  artist: string
  album: string
  durasi: number
}

interface Playlist {
  id: string
  judul: string
  deskripsi: string
}

export default function AddSongToPlaylistPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const params = useParams()
  const playlistId = params.id as string
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [availableSongs, setAvailableSongs] = useState<Song[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSongs, setLoadingSongs] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    loadPlaylistData()
  }, [user, router, playlistId])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = availableSongs.filter(song =>
        song.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.album.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredSongs(filtered)
    } else {
      setFilteredSongs(availableSongs)
    }
  }, [searchQuery, availableSongs])

  const loadPlaylistData = async () => {
    try {
      const [playlistData, songsData] = await Promise.all([
        playlistAPI.getPlaylistDetail(playlistId),
        playlistAPI.getAvailableSongs()
      ])
      
      setPlaylist(playlistData.playlist)
      setAvailableSongs(songsData.songs || [])
      setFilteredSongs(songsData.songs || [])
    } catch (error) {
      showToast('Failed to load playlist data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSong = async (songId: string, songTitle: string) => {
    try {
      setLoadingSongs(true)
      await playlistAPI.addSongToPlaylist(playlistId, songId)
      showToast(`Berhasil menambahkan lagu "${songTitle}" ke playlist!`, 'success')
      // Remove song from available list
      setAvailableSongs(prev => prev.filter(song => song.id !== songId))
      setFilteredSongs(prev => prev.filter(song => song.id !== songId))
    } catch (error: any) {
      if (error.message?.includes('already')) {
        showToast(`Lagu "${songTitle}" sudah ada di playlist ini!`, 'error')
      } else {
        showToast(error.message || 'Gagal menambahkan lagu ke playlist', 'error')
      }
    } finally {
      setLoadingSongs(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
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

  if (!playlist) {
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push(`/playlist/${playlistId}`)}
            className="text-white hover:bg-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Playlist
          </Button>
        </div>



        {/* Playlist Info */}
        <Card className="mb-6 bg-gray-900/80 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2">
              <Plus className="w-6 h-6 text-green-400" />
              Tambah Lagu ke Playlist
            </CardTitle>
            <p className="text-gray-400">Playlist: {playlist.judul}</p>
          </CardHeader>
        </Card>

        {/* Search */}
        <Card className="mb-6 bg-gray-900/80 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search for songs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                />
              </div>
              <Button 
                className="btn-spotify"
                disabled={!searchQuery.trim()}
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Songs */}
        <Card className="bg-gray-900/80 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Music className="w-5 h-5 mr-2 text-green-400" />
              Available Songs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSongs.length === 0 ? (
              <div className="text-center py-8">
                <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Songs Found</h3>
                <p className="text-gray-400">
                  {searchQuery ? `No songs match "${searchQuery}"` : 'No songs available'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Song
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Artist
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Album
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
                    {filteredSongs.map((song) => (
                      <tr key={song.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center mr-3">
                              <Music className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{song.judul}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            {song.artist}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center">
                            <Disc className="w-4 h-4 mr-2 text-gray-400" />
                            {song.album}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDuration(song.durasi)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button 
                            size="sm" 
                            className="btn-spotify"
                            onClick={() => handleAddSong(song.id, song.judul)}
                            disabled={loadingSongs}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
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