"use client"

import { useEffect, useState } from 'react'
import { useAuth, useToast } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { albumAPI } from '@/lib/api'
import { Music, Search } from 'lucide-react'

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
  const [albums, setAlbums] = useState<Album[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

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

  const filteredAlbums = albums.filter(album =>
    album.judul.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-gray-900/80 border-0 shadow-md animate-pulse">
                <div className="aspect-square bg-gray-700 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No albums found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'No albums are published under your label yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlbums.map((album) => (
              <Card key={album.id} className="bg-gray-900/80 border-0 shadow-md hover:border-green-500/50 transition-all group">
                <div className="aspect-square bg-gradient-to-br from-green-600 to-green-800 rounded-t-lg flex items-center justify-center">
                  <Music className="w-16 h-16 text-white/80" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg text-white group-hover:text-green-400 transition-colors mb-2">
                    {album.judul}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-400">
                    <p>{album.jumlah_lagu} songs</p>
                    <p>{formatDuration(album.total_durasi)}</p>
                    <p>Released: {formatDate(album.tanggal_rilis)}</p>
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