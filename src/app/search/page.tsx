"use client"

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { searchAPI } from '@/lib/api'
import { 
  Search as SearchIcon, 
  Music, 
  Mic, 
  Library, 
  Eye
} from 'lucide-react'

interface SearchResult {
  type: 'SONG' | 'PODCAST' | 'USER_PLAYLIST'
  judul: string
  oleh: string
  id: string
}

function SearchForm({ onSearch, loading, query, setQuery }: {
  onSearch: (e: React.FormEvent) => void
  loading: boolean
  query: string
  setQuery: (value: string) => void
}) {
  return (
    <Card className="card-spotify mb-6">
      <CardContent className="pt-6">
        <form onSubmit={onSearch} className="flex space-x-2">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search for songs, podcasts, or playlists..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 form-input"
            />
          </div>
          <Button type="submit" disabled={loading} className="btn-spotify">
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                <SearchIcon className="w-4 h-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function SearchResults({ results, query, loading }: {
  results: SearchResult[]
  query: string
  loading: boolean
}) {
  const router = useRouter()

  const getIcon = (type: string) => {
    switch (type) {
      case 'SONG': return Music
      case 'PODCAST': return Mic
      case 'USER_PLAYLIST': return Library
      default: return Music
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SONG': return 'text-green-500'
      case 'PODCAST': return 'text-purple-500'
      case 'USER_PLAYLIST': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  const handleView = (result: SearchResult) => {
    switch (result.type) {
      case 'SONG':
        router.push(`/song/${result.id}`)
        break
      case 'PODCAST':
        router.push(`/podcast/${result.id}`)
        break
      case 'USER_PLAYLIST':
        router.push(`/playlist/${result.id}`)
        break
    }
  }

  if (loading) {
    return (
      <Card className="card-spotify">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-400">Searching...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (results.length === 0) {
    return (
      <Card className="card-spotify">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Results Found</h3>
            <p className="text-gray-400">
              Sorry, no results found for &quot;{query}&quot;. Try different keywords.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-spotify">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Search Results for &quot;{query}&quot;
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-300">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-300">Title</th>
                <th className="text-left py-3 px-4 font-medium text-gray-300">By</th>
                <th className="text-left py-3 px-4 font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => {
                const IconComponent = getIcon(result.type)
                const typeColor = getTypeColor(result.type)
                
                return (
                  <tr key={index} className="table-row">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <IconComponent className={`w-4 h-4 ${typeColor}`} />
                        <span className={`text-sm font-medium ${typeColor}`}>
                          {result.type}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white font-medium">{result.judul}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-300">{result.oleh}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleView(result)}
                        className="hover-scale"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function SearchPageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const initialQuery = searchParams.get('q') || ''
    if (initialQuery) {
      setQuery(initialQuery)
      performSearch(initialQuery)
    }
  }, [searchParams])

  if (!user) {
    router.push('/login')
    return null
  }

  const performSearch = async (searchQuery: string) => {
    setLoading(true)
    setHasSearched(true)

    try {
      const data = await searchAPI.search(searchQuery)
      setResults(data || [])
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    await performSearch(query)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Search</h1>
        <p className="text-gray-400">Find songs, podcasts, and playlists</p>
      </div>

      <SearchForm 
        onSearch={handleSearch}
        loading={loading}
        query={query}
        setQuery={setQuery}
      />

      {hasSearched && (
        <SearchResults 
          results={results}
          query={query}
          loading={loading}
        />
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Search</h1>
          <p className="text-gray-400">Find songs, podcasts, and playlists</p>
        </div>
        <Card className="card-spotify">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-400">Loading search...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
} 