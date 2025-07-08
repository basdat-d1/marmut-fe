"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
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
  DollarSign
} from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const isLandingPage = pathname === '/'
  const isAuthPage = pathname === '/login' || pathname === '/register'

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
    <nav className="bg-black text-white px-6 py-4 border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-green-500">
          Marmut
        </Link>
        
        <div className="hidden md:flex space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-white hover:bg-gray-800">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>

          {user && !user.is_label && (
            <Link href="/chart">
              <Button variant="ghost" className="text-white hover:bg-gray-800">
                <BarChart3 className="w-4 h-4 mr-2" />
                Chart
              </Button>
            </Link>
          )}

          {user && !user.is_label && (
            <Link href="/search">
              <Button variant="ghost" className="text-white hover:bg-gray-800">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </Link>
          )}

          {user && !user.is_label && (
            <Link href="/playlist">
              <Button variant="ghost" className="text-white hover:bg-gray-800">
                <Library className="w-4 h-4 mr-2" />
                Playlist
              </Button>
            </Link>
          )}

          {user && !user.is_label && (
            <Link href="/subscription">
              <Button variant="ghost" className="text-white hover:bg-gray-800">
                <Package className="w-4 h-4 mr-2" />
                Subscription
              </Button>
            </Link>
          )}

          {user && user.is_premium && !user.is_label && (
            <Link href="/downloaded-songs">
              <Button variant="ghost" className="text-white hover:bg-gray-800">
                <Download className="w-4 h-4 mr-2" />
                Downloads
              </Button>
            </Link>
          )}

          {user && user.is_podcaster && (
            <Link href="/podcast">
              <Button variant="ghost" className="text-white hover:bg-gray-800">
                <Mic className="w-4 h-4 mr-2" />
                Podcast
              </Button>
            </Link>
          )}

          {user && (user.is_artist || user.is_songwriter) && (
            <Link href="/album">
              <Button variant="ghost" className="text-white hover:bg-gray-800">
                <Music className="w-4 h-4 mr-2" />
                Albums
              </Button>
            </Link>
          )}

          {user && user.is_label && (
            <Link href="/label-album">
              <Button variant="ghost" className="text-white hover:bg-gray-800">
                <Music className="w-4 h-4 mr-2" />
                Albums
              </Button>
            </Link>
          )}

          {user && (user.is_artist || user.is_songwriter || user.is_label) && (
            <Link href="/royalty">
              <Button variant="ghost" className="text-white hover:bg-gray-800">
                <DollarSign className="w-4 h-4 mr-2" />
                Royalty
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
  )
} 