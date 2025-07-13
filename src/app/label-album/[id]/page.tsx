"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { podcastAPI } from '@/lib/api'

interface Song {
  id: string
  judul: string
  durasi: string
  total_play: number
  total_download: number
}

export default function LabelAlbumDetailPage() {
  const router = useRouter()
  const params = useParams()
  const albumId = params.id as string
  const [album, setAlbum] = useState<{ id: string; judul: string } | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [songToDelete, setSongToDelete] = useState<Song | null>(null)

  useEffect(() => {
    loadAlbumSongs()
  }, [albumId])

  const loadAlbumSongs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/album-song/label-album/${albumId}/songs/`)
      const data = await res.json()
      setAlbum(data.album)
      setSongs(data.songs)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSong = async (songId: string) => {
    await fetch(`/api/album-song/label-song/${songId}/delete/`, { method: 'DELETE' })
    await loadAlbumSongs()
  }

  const handleDeleteConfirm = async () => {
    if (songToDelete) {
      await handleDeleteSong(songToDelete.id)
      setSongToDelete(null)
    }
    setShowDeleteConfirm(false)
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-900/80 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Daftar Lagu pada {album?.judul}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Judul</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Durasi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Play</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Download</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {songs.map((song) => (
                    <tr key={song.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-white">{song.judul}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{song.durasi}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{song.total_play}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{song.total_download}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button size="sm" className="btn-spotify" onClick={() => router.push(`/song/${song.id}`)}>
                            View Details
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white" onClick={() => { setSongToDelete(song); setShowDeleteConfirm(true) }}>
                            Delete
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
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => { setShowDeleteConfirm(false); setSongToDelete(null) }}
          onConfirm={handleDeleteConfirm}
          title="Delete Song"
          message={`Are you sure you want to delete the song \"${songToDelete?.judul}\"? This action cannot be undone.`}
          type="delete"
          confirmText="Delete Song"
        />
      </div>
    </div>
  )
} 