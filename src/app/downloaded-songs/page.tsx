"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { downloadedSongsAPI } from '@/lib/api'
import { Download, Music, Trash2 } from 'lucide-react'

interface DownloadedSong {
  id: string
  judul: string
  artist: string
  album: string
  durasi: string
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
    loadDownloadedSongs()
  }, [user, router])

  const loadDownloadedSongs = async () => {
    setLoading(true)
    try {
      const data = await downloadedSongsAPI.getDownloadedSongs()
      setSongs(data.songs || [])
    } catch (error) {
      showToast('Failed to load downloaded songs', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSong = async (songId: string) => {
    try {
      await downloadedSongsAPI.removeDownloadedSong(songId)
      setSongs(prev => prev.filter(song => song.id !== songId))
      showToast('Song removed from downloads!', 'success')
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
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-900/80 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><Download className="w-5 h-5" /> Downloaded Songs</CardTitle>
          </CardHeader>
          <CardContent>
            {songs.length === 0 ? (
              <div className="text-gray-400 text-center py-8">Belum ada lagu yang diunduh</div>
            ) : (
              <ul className="divide-y divide-gray-800">
                {songs.map((song) => (
                  <li key={song.id} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <Music className="w-8 h-8 text-green-400" />
                      <div>
                        <div className="text-white font-semibold">{song.judul}</div>
                        <div className="text-gray-400 text-sm">{song.artist} • {song.album}</div>
                        <div className="text-gray-500 text-xs">{song.durasi}</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="border-gray-700 text-red-400 hover:bg-gray-800"
                      onClick={() => {
                        setSongToDelete(song)
                        setShowDeleteConfirm(true)
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Remove
                    </Button>
                  </li>
                ))}
              </ul>
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
          title="Remove Downloaded Song"
          message={`Are you sure you want to remove \"${songToDelete?.judul}\" from your downloads?`}
          type="delete"
          confirmText="Remove"
        />
      </div>
    </div>
  )
} 