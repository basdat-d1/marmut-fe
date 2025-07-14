"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
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
  DollarSign,
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
  const { user, label, logout } = useAuth()
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

  if (!user && !label && isAuthPage) {
    return null
  }

  if (!user && !label && isLandingPage) {
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

          <button
            className="md:hidden focus-ring"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

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

  if (!user && !label) {
    return null
  }

  if (label) {
  return (
    <>
    <nav className="bg-black text-white px-6 py-3 border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-green-500 flex-shrink-0">
          Marmut
        </Link>
          <div className="hidden md:flex space-x-3 ml-8">
            <Link href="/dashboard">
            <Button variant="ghost" className={`text-white hover:bg-gray-800 text-sm px-3 py-1.5 relative ${pathname === '/dashboard' ? 'border-b-2 border-white' : ''}`}>
              <Home className="w-4 h-4 mr-1" />
              <span className="text-sm">Dashboard</span>
            </Button>
            </Link>

            <Link href="/label-album">
                <Button variant="ghost" className={`text-white hover:bg-gray-800 text-sm px-3 py-1.5 relative ${pathname.startsWith('/label-album') ? 'border-b-2 border-white' : ''}`}>
                <Music className="w-4 h-4 mr-1" />
                <span className="text-sm">Album & Songs</span>
              </Button>
            </Link>

            <Link href="/royalty">
                <Button variant="ghost" className={`text-white hover:bg-gray-800 text-sm px-3 py-1.5 relative ${pathname === '/royalty' ? 'border-b-2 border-white' : ''}`}>
                <DollarSign className="w-4 h-4 mr-1" />
                <span className="text-sm">Royalty</span>
              </Button>
            </Link>

            <Button 
              variant="ghost" 
              onClick={logout}
              className="text-white hover:bg-gray-800 text-sm px-3 py-1.5"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="text-sm">Logout</span>
            </Button>
          </div>
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {/* Mobile menu for label */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            <Link href="/dashboard">
              <Button variant="ghost" className={`w-full text-white hover:bg-gray-800 justify-start ${pathname === '/dashboard' ? 'bg-gray-800' : ''}`}>
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/label-album">
              <Button variant="ghost" className={`w-full text-white hover:bg-gray-800 justify-start ${pathname.startsWith('/label-album') ? 'bg-gray-800' : ''}`}>
                <Music className="w-4 h-4 mr-2" />
                Album
              </Button>
            </Link>
            <Link href="/royalty">
              <Button variant="ghost" className={`w-full text-white hover:bg-gray-800 justify-start ${pathname === '/royalty' ? 'bg-gray-800' : ''}`}>
                <DollarSign className="w-4 h-4 mr-2" />
                Royalty
              </Button>
            </Link>
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

  if (user) {
    const isArtist = user?.is_artist;
    const isSongwriter = user?.is_songwriter;
    const isPodcaster = user?.is_podcaster;
    const isPremium = user?.is_premium;
    const isRegular = !isArtist && !isSongwriter && !isPodcaster;
    const isUserBiasaOrArtistOrSongwriterOrPodcaster = isRegular || isArtist || isSongwriter || isPodcaster;
    const isArtistOrSongwriter = isArtist || isSongwriter;
    const isArtistSongwriterLabel = isArtist || isSongwriter;

    return (
    <>
    <nav className="bg-black text-white px-6 py-3 border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-green-500 flex-shrink-0">
          Marmut
        </Link>
          <div className="hidden md:flex space-x-3 ml-8">
            {/* Dashboard - always visible */}
            <Link href="/dashboard">
                <Button variant="ghost" className={`text-white hover:bg-gray-800 text-sm px-3 py-1.5 relative ${pathname === '/dashboard' ? 'border-b-2 border-white' : ''}`}>
                <Home className="w-4 h-4 mr-1" />
                <span className="text-sm">Dashboard</span>
                </Button>
              </Link>

            {isUserBiasaOrArtistOrSongwriterOrPodcaster && (
              <>
              <Link href="/chart">
                <Button variant="ghost" className={`text-white hover:bg-gray-800 text-sm px-3 py-1.5 relative ${pathname === '/chart' ? 'border-b-2 border-white' : ''}`}>
                  <BarChart3 className="w-4 h-4 mr-1" />
                  <span className="text-sm">Chart</span>
                </Button>
              </Link>
                <Link href="/search">
                  <Button variant="ghost" className={`text-white hover:bg-gray-800 text-sm px-3 py-1.5 relative ${pathname === '/search' ? 'border-b-2 border-white' : ''}`}>
                    <Search className="w-4 h-4 mr-1" />
                    <span className="text-sm">Search</span>
                  </Button>
                </Link>
                <Link href="/playlist">
                  <Button variant="ghost" className={`text-white hover:bg-gray-800 text-sm px-3 py-1.5 relative ${pathname.startsWith('/playlist') ? 'border-b-2 border-white' : ''}`}>
                    <Library className="w-4 h-4 mr-1" />
                    <span className="text-sm">Playlist</span>
                  </Button>
                </Link>
              <Link href="/subscription">
                  <Button variant="ghost" className={`text-white hover:bg-gray-800 text-sm px-3 py-1.5 relative ${pathname.startsWith('/subscription') ? 'border-b-2 border-white' : ''}`}>
                    <Package className="w-4 h-4 mr-1" />
                    <span className="text-sm">Subscription</span>
                  </Button>
                </Link>
              </>
            )}

            {/* Only for Premium */}
            {isPremium && (
              <Link href="/downloaded-songs">
                <Button variant="ghost" className={`text-white hover:bg-gray-800 text-sm px-3 py-1.5 relative ${pathname === '/downloaded-songs' ? 'border-b-2 border-white' : ''}`}>
                  <Download className="w-4 h-4 mr-1" />
                  <span className="text-sm">Downloaded Songs</span>
                </Button>
              </Link>
            )}

            {/* Only for Podcaster */}
            {isPodcaster && (
              <Link href="/podcast">
                <Button variant="ghost" className={`text-white hover:bg-gray-800 text-sm px-3 py-1.5 relative ${pathname.startsWith('/podcast') ? 'border-b-2 border-white' : ''}`}>
                  <Mic className="w-4 h-4 mr-1" />
                  <span className="text-sm">Podcast</span>
              </Button>
            </Link>
          )}

            {isArtistOrSongwriter && (
              <Link href="/album">
                <Button variant="ghost" className={`text-white hover:bg-gray-800 text-sm px-3 py-1.5 relative ${pathname.startsWith('/album') ? 'border-b-2 border-white' : ''}`}>
                  <Music className="w-4 h-4 mr-1" />
                  <span className="text-sm">Album & Songs</span>
                </Button>
              </Link>
            )}

            {isArtistSongwriterLabel && (
              <Link href="/royalty">
                <Button variant="ghost" className={`text-white hover:bg-gray-800 text-sm px-3 py-1.5 relative ${pathname === '/royalty' ? 'border-b-2 border-white' : ''}`}>
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span className="text-sm">Royalty</span>
              </Button>
            </Link>
          )}

          <Button 
            variant="ghost" 
            onClick={logout}
            className="text-white hover:bg-gray-800 text-sm px-3 py-1.5"
          >
            <LogOut className="w-4 h-4 mr-1" />
            <span className="text-sm">Logout</span>
          </Button>
        </div>
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {isMenuOpen && (
        <div className="md:hidden mt-4 space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" className={`w-full text-white hover:bg-gray-800 justify-start ${pathname === '/dashboard' ? 'bg-gray-800' : ''}`}>
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
            {isUserBiasaOrArtistOrSongwriterOrPodcaster && (
              <>
            <Link href="/chart">
              <Button variant="ghost" className={`w-full text-white hover:bg-gray-800 justify-start ${pathname === '/chart' ? 'bg-gray-800' : ''}`}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Chart
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="ghost" className={`w-full text-white hover:bg-gray-800 justify-start ${pathname === '/search' ? 'bg-gray-800' : ''}`}>
                <Search className="w-4 h-4 mr-2" />
                    Search
              </Button>
            </Link>
            <Link href="/playlist">
              <Button variant="ghost" className={`w-full text-white hover:bg-gray-800 justify-start ${pathname.startsWith('/playlist') ? 'bg-gray-800' : ''}`}>
                <Library className="w-4 h-4 mr-2" />
                    Playlist
              </Button>
            </Link>
            <Link href="/subscription">
              <Button variant="ghost" className={`w-full text-white hover:bg-gray-800 justify-start ${pathname.startsWith('/subscription') ? 'bg-gray-800' : ''}`}>
                <Package className="w-4 h-4 mr-2" />
                    Subscription Package
              </Button>
            </Link>
              </>
          )}
            {isPremium && (
            <Link href="/downloaded-songs">
              <Button variant="ghost" className={`w-full text-white hover:bg-gray-800 justify-start ${pathname === '/downloaded-songs' ? 'bg-gray-800' : ''}`}>
                <Download className="w-4 h-4 mr-2" />
                  Downloaded Songs
              </Button>
            </Link>
          )}
            {isPodcaster && (
            <Link href="/podcast">
              <Button variant="ghost" className={`w-full text-white hover:bg-gray-800 justify-start ${pathname.startsWith('/podcast') ? 'bg-gray-800' : ''}`}>
                <Mic className="w-4 h-4 mr-2" />
                  Kelola Podcast
              </Button>
            </Link>
          )}
            {isArtistOrSongwriter && (
            <Link href="/album">
              <Button variant="ghost" className={`w-full text-white hover:bg-gray-800 justify-start ${pathname.startsWith('/album') ? 'bg-gray-800' : ''}`}>
                <Music className="w-4 h-4 mr-2" />
                  Kelola Album & Songs
              </Button>
            </Link>
          )}
            {isArtistSongwriterLabel && (
            <Link href="/royalty">
              <Button variant="ghost" className={`w-full text-white hover:bg-gray-800 justify-start ${pathname === '/royalty' ? 'bg-gray-800' : ''}`}>
                <DollarSign className="w-4 h-4 mr-2" />
                  Cek Royalti
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

  return null
} 