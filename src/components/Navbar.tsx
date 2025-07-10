"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth, useToast } from '@/contexts/AuthContext'
import { searchAPI } from '@/lib/api'
import { 
  Home, 
  Search, 
  Library, 
  LogOut, 
  Music, 
  Mic,
  BarChart3,
  Download,
  Package,
  Crown,
  DollarSign,
  X,
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

export default function Navbar() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const pathname = usePathname()
  const isLandingPage = pathname === '/'
  const isAuthPage = pathname === '/login' || pathname === '/register'

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearchLoading(true)

    try {
      const data: SearchResponse = await searchAPI.search(searchQuery)
      
      // Combine all results from different categories
      const allResults = [
        ...(data.results.songs || []),
        ...(data.results.podcasts || []),
        ...(data.results.playlists || [])
      ]
      
      setSearchResults(allResults)
    } catch (error: any) {
      showToast(error.message || 'Search failed. Please try again.', 'error')
      setSearchResults([])
    } finally {
      setSearchLoading(false)
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
    setIsSearchOpen(false)
    setSearchResults([])
    setSearchQuery('')
    
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
    if (item.tipe === 'SONG') {
      setIsSearchOpen(false)
      setSearchResults([])
      setSearchQuery('')
      router.push(`/song/${item.id}`)
    }
  }

  // Don't show navbar on auth pages (login/register)
  if (!user && isAuthPage) {
    return null
  }

  // Show guest navbar only on landing page for non-authenticated users
  if (!user && isLandingPage) {
    return (
      <nav className="bg-black/95 backdrop-blur-sm text-white px-6 py-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-green-500 hover-scale">
            Marmut
          </Link>
          
          <div className="hidden md:flex space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="nav-link">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="btn-spotify">
                Register
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden focus-ring"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            <Link href="/login">
              <Button variant="ghost" className="w-full nav-link justify-start">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="w-full btn-spotify">
                Register
              </Button>
            </Link>
          </div>
        )}
      </nav>
    )
  }

  // Don't show navbar if user is not logged in and not on landing page
  if (!user) {
    return null
  }

  // Authenticated user navbar
  return (
    <>
      <nav className="bg-black text-white px-6 py-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-green-500">
            Marmut
          </Link>
          
          <div className="hidden md:flex space-x-3">
            <Button variant="ghost" className="text-white hover:bg-gray-800 text-base px-3 py-1.5">
              <Home className="w-4 h-4 mr-1" />
              <span className="text-sm">Dashboard</span>
            </Button>

            {user && !user.is_label && (
              <Link href="/chart">
                <Button variant="ghost" className="text-white hover:bg-gray-800 text-base px-3 py-1.5">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  <span className="text-sm">Chart</span>
                </Button>
              </Link>
            )}

            {user && !user.is_label && (
              <Link href="/search">
                <Button variant="ghost" className="text-white hover:bg-gray-800 text-base px-3 py-1.5">
                  <Search className="w-4 h-4 mr-1" />
                  <span className="text-sm">Search</span>
                </Button>
              </Link>
            )}

            {user && !user.is_label && (
              <Link href="/playlist">
                <Button variant="ghost" className="text-white hover:bg-gray-800 text-base px-3 py-1.5">
                  <Library className="w-4 h-4 mr-1" />
                  <span className="text-sm">Playlist</span>
                </Button>
              </Link>
            )}

            {user && !user.is_label && (
              <Link href="/subscription">
                <Button variant="ghost" className="text-white hover:bg-gray-800 text-base px-3 py-1.5">
                  <Package className="w-4 h-4 mr-1" />
                  <span className="text-sm">Subscription</span>
                </Button>
              </Link>
            )}

            {user && user.is_premium && !user.is_label && (
              <Link href="/downloaded-songs">
                <Button variant="ghost" className="text-white hover:bg-gray-800 text-base px-3 py-1.5">
                  <Download className="w-4 h-4 mr-1" />
                  <span className="text-sm">Downloads</span>
                </Button>
              </Link>
            )}

            {user && user.is_podcaster && (
              <Link href="/podcast">
                <Button variant="ghost" className="text-white hover:bg-gray-800 text-base px-3 py-1.5">
                  <Mic className="w-4 h-4 mr-1" />
                  <span className="text-sm">Podcast</span>
                </Button>
              </Link>
            )}

            {user && (user.is_artist || user.is_songwriter) && (
              <Link href="/album">
                <Button variant="ghost" className="text-white hover:bg-gray-800 text-base px-3 py-1.5">
                  <Music className="w-4 h-4 mr-1" />
                  <span className="text-sm">Albums</span>
                </Button>
              </Link>
            )}

            {user && user.is_label && (
              <Link href="/label-album">
                <Button variant="ghost" className="text-white hover:bg-gray-800 text-base px-3 py-1.5">
                  <Music className="w-4 h-4 mr-1" />
                  <span className="text-sm">Albums</span>
                </Button>
              </Link>
            )}

            {user && (user.is_artist || user.is_songwriter || user.is_label) && (
              <Link href="/royalty">
                <Button variant="ghost" className="text-white hover:bg-gray-800 text-base px-3 py-1.5">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span className="text-sm">Royalty</span>
                </Button>
              </Link>
            )}

            <Button 
              variant="ghost" 
              onClick={logout}
              className="text-white hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu for authenticated users */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full text-white hover:bg-gray-800 justify-start">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>

            {user && !user.is_label && (
              <Link href="/chart">
                <Button variant="ghost" className="w-full text-white hover:bg-gray-800 justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Chart
                </Button>
              </Link>
            )}

            {user && !user.is_label && (
              <Link href="/search">
                <Button variant="ghost" className="w-full text-white hover:bg-gray-800 justify-start">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </Link>
            )}

            {user && !user.is_label && (
              <Link href="/playlist">
                <Button variant="ghost" className="w-full text-white hover:bg-gray-800 justify-start">
                  <Library className="w-4 h-4 mr-2" />
                  Playlist
                </Button>
              </Link>
            )}

            {user && !user.is_label && (
              <Link href="/subscription">
                <Button variant="ghost" className="w-full text-white hover:bg-gray-800 justify-start">
                  <Package className="w-4 h-4 mr-2" />
                  Subscription
                </Button>
              </Link>
            )}

            {user && user.is_premium && !user.is_label && (
              <Link href="/downloaded-songs">
                <Button variant="ghost" className="w-full text-white hover:bg-gray-800 justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Downloads
                </Button>
              </Link>
            )}

            {user && user.is_podcaster && (
              <Link href="/podcast">
                <Button variant="ghost" className="w-full text-white hover:bg-gray-800 justify-start">
                  <Mic className="w-4 h-4 mr-2" />
                  Podcast
                </Button>
              </Link>
            )}

            {user && (user.is_artist || user.is_songwriter) && (
              <Link href="/album">
                <Button variant="ghost" className="w-full text-white hover:bg-gray-800 justify-start">
                  <Music className="w-4 h-4 mr-2" />
                  Albums
                </Button>
              </Link>
            )}

            {user && user.is_label && (
              <Link href="/label-album">
                <Button variant="ghost" className="w-full text-white hover:bg-gray-800 justify-start">
                  <Music className="w-4 h-4 mr-2" />
                  Albums
                </Button>
              </Link>
            )}

            {user && (user.is_artist || user.is_songwriter || user.is_label) && (
              <Link href="/royalty">
                <Button variant="ghost" className="w-full text-white hover:bg-gray-800 justify-start">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Royalty
                </Button>
              </Link>
            )}

            <Button 
              variant="ghost" 
              onClick={logout}
              className="w-full text-white hover:bg-gray-800 justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </nav>
    </>
  )
} 