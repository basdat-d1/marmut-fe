"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { dashboardAPI } from '@/lib/api'
import { royaltyAPI } from '@/lib/api'
import { 
  User, 
  Crown, 
  Album,
  Library,
  TrendingUp,
  Music,
  Zap,
  Shield,
  DollarSign
} from 'lucide-react'

interface UserProfile {
  email: string
  nama: string
  gender: number
  tempat_lahir: string
  tanggal_lahir: string
  kota_asal: string
  is_verified: boolean
  is_artist: boolean
  is_songwriter: boolean
  is_podcaster: boolean
  is_premium: boolean
  kontak?: string
  playlists?: any[]
  songs?: any[]
  podcasts?: any[]
  albums?: any[]
}

export default function DashboardPage() {
  const { user, label, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [error, setError] = useState('')
  const [labelRoyalty, setLabelRoyalty] = useState<number | null>(null)
  const [loadingRoyalty, setLoadingRoyalty] = useState(false)

  useEffect(() => {
    if (!loading && !user && !label) {
      router.push('/')
    }
  }, [user, label, loading, router])

  useEffect(() => {
    if (user || label) {
      loadUserProfile()
      if (label) {
        loadLabelRoyalty()
      }
    }
  }, [user, label])

  const loadUserProfile = async () => {
    if (!user && !label) return
    
    try {
      let profileData: any = {}
      
      if (label) {
        profileData = await dashboardAPI.getLabelProfile()
      } else {
        profileData = await dashboardAPI.getUserProfile()
      }

      setProfile(profileData)
    } catch (error) {
      setError('Failed to load profile data')
    } finally {
      setLoadingProfile(false)
    }
  }

  const loadLabelRoyalty = async () => {
    setLoadingRoyalty(true)
    try {
      const data = await royaltyAPI.getLabelRoyalties()
      setLabelRoyalty(data?.total_royalty || 0)
    } catch (e) {
      setLabelRoyalty(0)
    } finally {
      setLoadingRoyalty(false)
    }
  }

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if ((!user && !label) || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h1>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">{error || 'Failed to load your profile'}</p>
          <Button 
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
          >
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  if (label) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-0 md:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="rounded-2xl bg-gradient-to-r from-green-700/80 to-blue-800/80 px-8 py-10 mb-8 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Welcome back, <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">{profile.nama}</span>! <span className="inline-block">👋</span>
              </h1>
              <p className="text-gray-200 text-lg">Here's what's happening with your music world</p>
            </div>
          </div>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gray-900/80 border-0 shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <span className="text-gray-400 mb-1">Total Albums</span>
                <span className="text-4xl font-bold text-blue-400">{profile.albums?.length || 0}</span>
                <Album className="w-8 h-8 text-blue-400 mt-2" />
              </CardContent>
            </Card>
            <Card className="bg-gray-900/80 border-0 shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <span className="text-gray-400 mb-1">Total Royalty</span>
                <span className="text-3xl font-bold text-green-400">
                  {loadingRoyalty ? '...' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(labelRoyalty || 0)}
                </span>
                <DollarSign className="w-8 h-8 text-green-400 mt-2" />
              </CardContent>
            </Card>
          </div>
          <div className="bg-gray-900/80 border-0 shadow-md rounded-2xl p-8 mb-8">
            <h2 className="text-white text-xl font-semibold mb-6 flex items-center gap-2">Label Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                                  <label className="text-xs text-gray-400">Label Name</label>
                <div className="text-white font-medium">{profile.nama}</div>
              </div>
              <div>
                <label className="text-xs text-gray-400">Email</label>
                <div className="text-white font-medium">{profile.email}</div>
              </div>
              {profile.kontak && (
                <div>
                  <label className="text-xs text-gray-400">Contact</label>
                  <div className="text-white font-medium">{profile.kontak}</div>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-400">Role</label>
                <div className="text-white font-medium">Label</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-900/80 border-0 shadow-md rounded-2xl p-8">
            <h2 className="text-white text-xl font-semibold mb-6 flex items-center gap-2">Album List</h2>
            {profile.albums && profile.albums.length > 0 ? (
              <ul className="space-y-2">
                {profile.albums.map((album: any) => (
                  <li key={album.id} className="text-white bg-gray-800/60 rounded-lg px-4 py-2">{album.judul}</li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400">No Albums Produced Yet</div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (user) {
  const getGenderText = (gender: number) => gender === 1 ? 'Male' : 'Female'
  
  const getRoles = () => {
    const roles = []
    if (profile.is_artist) roles.push('Artist')
    if (profile.is_songwriter) roles.push('Songwriter')
    if (profile.is_podcaster) roles.push('Podcaster')
    
    // If no specific roles, show as Regular User
    if (roles.length === 0) {
      return 'Regular User'
    }
    
    return roles.join(', ')
  }

  const shouldShowAlbums = () => {
      return profile.is_artist || profile.is_songwriter
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-0 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl bg-gradient-to-r from-green-700/80 to-blue-800/80 px-8 py-10 mb-8 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Welcome back, <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">{profile.nama}</span>! <span className="inline-block">👋</span>
            </h1>
            <p className="text-gray-200 text-lg">Here's what's happening with your music world</p>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${shouldShowAlbums() ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 mb-8`}>
          <Card className="bg-gray-900/80 border-0 shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <span className="text-gray-400 mb-1">Playlists</span>
              <span className="text-4xl font-bold text-green-400">{profile.playlists?.length || 0}</span>
              <Library className="w-8 h-8 text-green-400 mt-2" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-600/80 to-yellow-800/80 border-0 shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <span className="text-gray-200 mb-1">Subscription</span>
              <span className="text-3xl font-bold text-yellow-300">{profile.is_premium ? 'Premium' : 'Basic'}</span>
              <Crown className="w-8 h-8 text-yellow-300 mt-2" />
            </CardContent>
          </Card>
          {shouldShowAlbums() && (
            <Card className="bg-gray-900/80 border-0 shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <span className="text-gray-400 mb-1">Albums</span>
                <span className="text-4xl font-bold text-blue-400">{profile.albums?.length || 0}</span>
                <Album className="w-8 h-8 text-blue-400 mt-2" />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-gray-900/80 border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2"><User className="w-5 h-5" /> Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400">Email</label>
                  <div className="text-white font-medium">{profile.email}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Name</label>
                  <div className="text-white font-medium">{profile.nama}</div>
                </div>
                  <div>
                    <label className="text-xs text-gray-400">Subscription Status</label>
                    <div className="text-white font-medium">{profile.is_premium ? 'Premium' : 'Basic'}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Gender</label>
                    <div className="text-white font-medium">{getGenderText(profile.gender)}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Birth Place</label>
                    <div className="text-white font-medium">{profile.tempat_lahir}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Birth Date</label>
                    <div className="text-white font-medium">{formatDate(profile.tanggal_lahir)}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Current City</label>
                    <div className="text-white font-medium">{profile.kota_asal}</div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-400">Role</label>
                    <div className="text-white font-medium">{getRoles()}</div>
                  </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2"><Zap className="w-5 h-5" /> Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 gap-3">
                <Button className="w-full h-16 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold text-lg flex items-center justify-start gap-4 px-6 shadow-md" onClick={() => router.push('/search')}>
                  <Music className="w-6 h-6" /> Discover Music
                </Button>
                <Button className="w-full h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold text-lg flex items-center justify-start gap-4 px-6 shadow-md" onClick={() => router.push('/chart')}>
                  <TrendingUp className="w-6 h-6" /> View Charts
                </Button>
                {!profile.is_premium && (
                  <Button className="w-full h-16 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl font-semibold text-lg flex items-center justify-start gap-4 px-6 shadow-md" onClick={() => router.push('/subscription')}>
                    <Crown className="w-6 h-6" /> Upgrade to Premium
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gray-900/80 border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-white">My Playlists</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.playlists && profile.playlists.length > 0 ? (
                  <ul className="space-y-2">
                    {profile.playlists.map((pl: any) => (
                      <li key={pl.id} className="text-white bg-gray-800/60 rounded-lg px-4 py-2">{pl.judul}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-400">No Playlists Yet</div>
                )}
              </CardContent>
            </Card>

          {(profile.is_artist || profile.is_songwriter) && (
            <Card className="bg-gray-900/80 border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-white">My Songs</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.songs && profile.songs.length > 0 ? (
                  <ul className="space-y-2">
                    {profile.songs.map((song: any) => (
                      <li key={song.id} className="text-white bg-gray-800/60 rounded-lg px-4 py-2">{song.judul}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-400">No Songs Yet</div>
                )}
              </CardContent>
            </Card>
          )}

          {profile.is_podcaster && (
            <Card className="bg-gray-900/80 border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-white">My Podcasts</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.podcasts && profile.podcasts.length > 0 ? (
                  <ul className="space-y-2">
                    {profile.podcasts.map((pod: any) => (
                      <li key={pod.id} className="text-white bg-gray-800/60 rounded-lg px-4 py-2">{pod.judul}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-400">No Podcasts Yet</div>
                )}
              </CardContent>
            </Card>
          )}
          </div>
      </div>
    </div>
  )
  }

  return null
} 