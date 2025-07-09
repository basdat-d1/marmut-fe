"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { dashboardAPI, playlistAPI, albumAPI, podcastAPI } from '@/lib/api'
import { 
  User, 
  Mic, 
  Crown, 
  Play,
  Album,
  Library,
  DollarSign,
  TrendingUp,
  Music,
  Heart,
  Star,
  Zap,
  Calendar,
  MapPin,
  Mail,
  Shield
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
  is_label: boolean
  kontak?: string
  playlists?: any[]
  songs?: any[]
  podcasts?: any[]
  albums?: any[]
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadUserProfile()
    }
  }, [user])

  const loadUserProfile = async () => {
    if (!user) return
    
    try {
      let profileData: any = {}
      
      if (user.is_label) {
        profileData = await dashboardAPI.getLabelProfile()
      } else {
        profileData = await dashboardAPI.getUserProfile()
      }

      // Load additional data based on user roles
      const additionalData: any = {}

      if (!user.is_label) {
        try {
          const playlistData = await playlistAPI.getUserPlaylists()
          additionalData.playlists = playlistData.playlists || []
        } catch (error) {
          additionalData.playlists = []
        }
      }

      if (user.is_artist || user.is_songwriter) {
        try {
          const albumData = await albumAPI.getUserAlbums()
          additionalData.albums = albumData.albums || []
        } catch (error) {
          additionalData.albums = []
        }
      }

      if (user.is_podcaster) {
        try {
          const podcastData = await podcastAPI.getUserPodcasts()
          additionalData.podcasts = podcastData.podcasts || []
        } catch (error) {
          additionalData.podcasts = []
        }
      }

      setProfile({
        ...profileData,
        ...additionalData,
      })
    } catch (error) {
      setError('Failed to load profile data')
    } finally {
      setLoadingProfile(false)
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

  if (!user || !profile) {
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

  const getGenderText = (gender: number) => gender === 1 ? 'Male' : 'Female'
  
  const getRoles = () => {
    const roles = []
    if (profile.is_artist) roles.push('Artist')
    if (profile.is_songwriter) roles.push('Songwriter')
    if (profile.is_podcaster) roles.push('Podcaster')
    if (profile.is_label) roles.push('Label')
    // Only show Music Lover if no other role
    if (roles.length === 0 && !profile.is_label) roles.push('Music Lover')
    return roles.join(', ')
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
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-green-700/80 to-blue-800/80 px-8 py-10 mb-8 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Welcome back, <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">{profile.nama}</span>! <span className="inline-block">👋</span>
            </h1>
            <p className="text-gray-200 text-lg">Here's what's happening with your music world</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-400 font-semibold text-sm flex items-center"><span className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></span>Online</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          <Card className="bg-gray-900/80 border-0 shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <span className="text-gray-400 mb-1">Albums</span>
              <span className="text-4xl font-bold text-blue-400">{profile.albums?.length || 0}</span>
              <Album className="w-8 h-8 text-blue-400 mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Info */}
          <Card className="bg-gray-900/80 border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2"><User className="w-5 h-5" /> Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400">EMAIL</label>
                  <div className="text-white font-medium">{profile.email}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-400">NAME</label>
                  <div className="text-white font-medium">{profile.nama}</div>
                </div>
                {/* Only for Pengguna (not label) */}
                {!profile.is_label && <>
                  <div>
                    <label className="text-xs text-gray-400">GENDER</label>
                    <div className="text-white font-medium">{getGenderText(profile.gender)}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">BIRTH PLACE</label>
                    <div className="text-white font-medium">{profile.tempat_lahir}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">BIRTH DATE</label>
                    <div className="text-white font-medium">{formatDate(profile.tanggal_lahir)}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">CITY</label>
                    <div className="text-white font-medium">{profile.kota_asal}</div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-400">Role</label>
                    <div className="text-white font-medium">Role: {getRoles()}</div>
                  </div>
                </>}
                {/* Only for Label */}
                {profile.is_label && profile.kontak && (
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-400">CONTACT</label>
                    <div className="text-white font-medium">{profile.kontak}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gray-900/80 border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2"><Zap className="w-5 h-5" /> Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 gap-3">
                <Button className="w-full h-16 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-semibold text-lg flex items-center justify-start gap-4 px-6 shadow-md" onClick={() => router.push('/playlist')}>
                  <Library className="w-6 h-6" /> My Playlists
                </Button>
                <Button className="w-full h-16 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold text-lg flex items-center justify-start gap-4 px-6 shadow-md" onClick={() => router.push('/search')}>
                  <Music className="w-6 h-6" /> Discover Music
                </Button>
                <Button className="w-full h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold text-lg flex items-center justify-start gap-4 px-6 shadow-md" onClick={() => router.push('/chart')}>
                  <TrendingUp className="w-6 h-6" /> View Charts
                </Button>
                {(profile.is_artist || profile.is_songwriter) && (
                  <Button className="w-full h-16 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg flex items-center justify-start gap-4 px-6 shadow-md" onClick={() => router.push('/album')}>
                    <Album className="w-6 h-6" /> Manage Albums
                  </Button>
                )}
                {(profile.is_artist || profile.is_songwriter) && (
                  <Button className="w-full h-16 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl font-semibold text-lg flex items-center justify-start gap-4 px-6 shadow-md" onClick={() => router.push('/royalty')}>
                    <DollarSign className="w-6 h-6" /> Check Royalties
                  </Button>
                )}
                {profile.is_podcaster && (
                  <Button className="w-full h-16 bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white rounded-xl font-semibold text-lg flex items-center justify-start gap-4 px-6 shadow-md" onClick={() => router.push('/podcast')}>
                    <Mic className="w-6 h-6" /> Manage Podcasts
                  </Button>
                )}
                {profile.is_label && (
                  <Button className="w-full h-16 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-semibold text-lg flex items-center justify-start gap-4 px-6 shadow-md" onClick={() => router.push('/label-album')}>
                    <Album className="w-6 h-6" /> Label Albums
                  </Button>
                )}
                {!profile.is_premium && (
                  <Button className="w-full h-16 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl font-semibold text-lg flex items-center justify-start gap-4 px-6 shadow-md" onClick={() => router.push('/subscription')}>
                    <Crown className="w-6 h-6" /> Upgrade to Premium
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daftar sesuai role */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Playlist untuk Pengguna Biasa */}
          {!profile.is_label && !profile.is_artist && !profile.is_songwriter && !profile.is_podcaster && (
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
                  <div className="text-gray-400">Belum Memiliki Playlist</div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Lagu untuk Artist/Songwriter */}
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
                  <div className="text-gray-400">Belum Memiliki Lagu</div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Podcast untuk Podcaster */}
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
                  <div className="text-gray-400">Belum Memiliki Podcast</div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Album untuk Label */}
          {profile.is_label && (
            <Card className="bg-gray-900/80 border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-white">My Albums</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.albums && profile.albums.length > 0 ? (
                  <ul className="space-y-2">
                    {profile.albums.map((album: any) => (
                      <li key={album.id} className="text-white bg-gray-800/60 rounded-lg px-4 py-2">{album.judul}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-400">Belum Memproduksi Album</div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 