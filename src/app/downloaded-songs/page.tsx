"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { downloadedSongsAPI } from '@/lib/api'
import { 
  Download, 
  Music, 
  Trash2, 
  Calendar,
  Crown
} from 'lucide-react'

interface DownloadedSong {
  id: string
  judul_lagu: string
  oleh: string
  tanggal_download: string
}

export default function DownloadedSongsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [downloadedSongs, setDownloadedSongs] = useState<DownloadedSong[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState('')

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
      setDownloadedSongs(data.downloaded_songs || [])
    } catch (error) {
      console.error('Failed to load downloaded songs:', error)
      setError('Failed to load downloaded songs')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveDownload = async (songId: string) => {
    if (!confirm('Are you sure you want to remove this song from your downloads?')) return

    setProcessing(songId)
    try {
      await downloadedSongsAPI.removeDownloadedSong(songId)
      setDownloadedSongs(prev => prev.filter(song => song.id !== songId))
    } catch (error: any) {
      setError(error.message || 'Failed to remove download')
    } finally {
      setProcessing(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (!user?.is_premium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Premium Required</h1>
          <p className="text-gray-400 mb-6">You need a premium subscription to access downloaded songs.</p>
          <Button 
            onClick={() => router.push('/subscription')}
            className="btn-spotify"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        </div>
      </div>
    )
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Downloaded Songs</h1>
          <p className="text-gray-400">Your offline music collection</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {downloadedSongs.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="text-center py-12">
              <Download className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Downloaded Songs</h3>
              <p className="text-gray-400 mb-4">You haven't downloaded any songs yet.</p>
              <Button 
                className="btn-spotify"
                onClick={() => router.push('/search')}
              >
                <Music className="w-4 h-4 mr-2" />
                Discover Music
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-400 mb-4">
              {downloadedSongs.length} song{downloadedSongs.length !== 1 ? 's' : ''} downloaded
            </div>
            
            {downloadedSongs.map((song) => (
              <Card key={song.id} className="bg-gray-900/50 border-gray-800 hover:border-green-500/50 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center">
                        <Music className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{song.judul_lagu}</h3>
                        <p className="text-sm text-gray-400">{song.oleh}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          Downloaded: {formatDate(song.tanggal_download)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        onClick={() => handleRemoveDownload(song.id)}
                        disabled={processing === song.id}
                      >
                        {processing === song.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 