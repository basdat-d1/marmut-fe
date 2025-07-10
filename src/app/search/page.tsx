"use client"

import { useState } from 'react'
import { useAuth, useToast } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { searchAPI } from '@/lib/api'
import { 
  Search, 
  Music, 
  Mic, 
  Library,
  Eye,
  Play
} from 'lucide-react'

interface SearchResult {
  id: string
  judul: string
  oleh: string
  tipe: 'SONG' | 'PODCAST' | 'USER_PLAYLIST'
  durasi?: number
  jumlah_lagu?: number
  total_durasi?: number
  total_play?: number
  jumlah_episode?: number
}

interface SearchResponse {
  message: string
  query: string
  results: {
    songs: SearchResult[]
    podcasts: SearchResult[]
    playlists: SearchResult[]
    total: number
  }
}

export default function SearchPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [message, setMessage] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)

    try {
      const data: SearchResponse = await searchAPI.search(query)
      
      // Combine all results from different categories
      const allResults = [
        ...(data.results.songs || []),
        ...(data.results.podcasts || []),
        ...(data.results.playlists || [])
      ]
      
      setResults(allResults)
      setMessage(data.message)
    } catch (error: any) {
      showToast(error.message || 'Search failed. Please try again.', 'error')
      setResults([])
      setMessage('')
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SONG':
        return <Music className="w-4 h-4 text-green-400" />
      case 'PODCAST':
        return <Mic className="w-4 h-4 text-blue-400" />
      case 'USER_PLAYLIST':
        return <Library className="w-4 h-4 text-purple-400" />
      default:
        return <Music className="w-4 h-4 text-gray-400" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'SONG':
        return 'SONG'
      case 'PODCAST':
        return 'PODCAST'
      case 'USER_PLAYLIST':
        return 'USER PLAYLIST'
      default:
        return type
    }
  }

  const handleViewItem = (item: SearchResult) => {
    switch (item.tipe) {
      case 'SONG':
        router.push(`/song/${item.id}`)
        break
      case 'PODCAST':
        router.push(`/podcast/${item.id}`)
        break
      case 'USER_PLAYLIST':
        router.push(`/playlist/${item.id}`)
        break
    }
  }

  const handlePlayItem = (item: SearchResult) => {
    // Handle play functionality based on item type
    if (item.tipe === 'SONG') {
      router.push(`/song/${item.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Search Bar</h1>
          <p className="text-gray-400">Discover music, podcasts, and playlists</p>
        </div>

        {/* Search Form */}
        <Card className="mb-6 bg-gray-900/80 border-0 shadow-md">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex space-x-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search for songs, podcasts, or playlists..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading || !query.trim()}
                className="btn-spotify"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </div>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    CARI
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searched && (
          <Card className="bg-gray-900/80 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-green-400" />
                {loading ? 'Searching...' : message || `Hasil Pencarian "${query}"`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                  <p className="mt-4 text-gray-400">Searching...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Results Found</h3>
                  <p className="text-gray-400">
                    Maaf, pencarian untuk "{query}" tidak ditemukan
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Tipe
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Judul
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Oleh
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {results.map((item) => (
                        <tr key={`${item.tipe}-${item.id}`} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(item.tipe)}
                              <span className="text-sm font-medium text-white">
                                {getTypeLabel(item.tipe)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{item.judul}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {item.oleh}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-gray-700 text-white hover:bg-gray-800"
                                onClick={() => handleViewItem(item)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Lihat
                              </Button>
                              {item.tipe === 'SONG' && (
                                <Button 
                                  size="sm" 
                                  className="btn-spotify"
                                  onClick={() => handlePlayItem(item)}
                                >
                                  <Play className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Search Suggestions */}
        {!searched && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Searches */}
            <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Search className="w-5 h-5 mr-2 text-blue-400" />
                  Popular Searches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {['love', 'rock', 'jazz', 'pop', 'classical', 'electronic'].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      className="border-blue-500/30 text-white hover:bg-blue-500/20 justify-start"
                      onClick={() => {
                        setQuery(suggestion)
                        // Auto-search when suggestion is clicked
                        setTimeout(() => {
                          const form = document.querySelector('form')
                          if (form) {
                            form.dispatchEvent(new Event('submit', { bubbles: true }))
                          }
                        }, 100)
                      }}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Search Tips */}
            <Card className="bg-gradient-to-br from-green-900/30 to-green-800/30 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Search className="w-5 h-5 mr-2 text-green-400" />
                  Search Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-white text-sm font-medium">Search by title</p>
                      <p className="text-gray-400 text-xs">Find songs, podcasts, or playlists by name</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-white text-sm font-medium">Search by artist</p>
                      <p className="text-gray-400 text-xs">Discover content from your favorite creators</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-white text-sm font-medium">Search by genre</p>
                      <p className="text-gray-400 text-xs">Explore different music styles and categories</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 