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
  Shield,
  Sparkles
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
          console.warn('Failed to load playlists:', error)
          additionalData.playlists = []
        }
      }

      if (user.is_artist || user.is_songwriter) {
        try {
          const albumData = await albumAPI.getUserAlbums()
          additionalData.albums = albumData.albums || []
        } catch (error) {
          console.warn('Failed to load albums:', error)
          additionalData.albums = []
        }
      }

      if (user.is_podcaster) {
        try {
          const podcastData = await podcastAPI.getUserPodcasts()
          additionalData.podcasts = podcastData.podcasts || []
        } catch (error) {
          console.warn('Failed to load podcasts:', error)
          additionalData.podcasts = []
        }
      }

      setProfile({
        ...profileData,
        ...additionalData,
      })
    } catch (error) {
      console.error('Failed to load profile:', error)
      setError('Failed to load profile data')
    } finally {
      setLoadingProfile(false)
    }
  }

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-500 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <p className="mt-6 text-gray-300 text-lg font-medium">Loading your dashboard...</p>
          <p className="mt-2 text-gray-500">Preparing your personalized experience</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h1>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">{error || 'Failed to load your profile'}</p>
          <Button 
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
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
    if (roles.length === 0) roles.push('Music Lover')
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20"></div>
        <div className="relative px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Welcome back, <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">{profile.nama}</span>! 👋
                </h1>
                <p className="text-gray-300 text-lg">Here's what's happening with your music world</p>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Online</span>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-sm">
                <p className="text-red-300">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {!profile.is_label && (
              <Card className="bg-gray-900/50 border-gray-800 hover:border-green-500/50 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Playlists</p>
                                             <p className="text-3xl font-bold text-white group-hover:text-green-400 transition-colors">
                        {profile.playlists?.length || 0}
                      </p>
                    </div>
                                         <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Library className="w-6 h-6 text-green-400" />
                     </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {(profile.is_artist || profile.is_songwriter) && (
              <Card className="bg-gray-900/50 border-gray-800 hover:border-blue-500/50 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Albums</p>
                      <p className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">
                        {profile.albums?.length || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Album className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {profile.is_podcaster && (
              <Card className="bg-gray-900/50 border-gray-800 hover:border-green-500/50 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Podcasts</p>
                      <p className="text-3xl font-bold text-white group-hover:text-green-400 transition-colors">
                        {profile.podcasts?.length || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mic className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className={`border-gray-800 transition-all duration-300 group ${
              profile.is_premium 
                ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 hover:border-yellow-500/50' 
                : 'bg-gray-900/50 hover:border-gray-500/50'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Subscription</p>
                    <p className={`text-3xl font-bold transition-colors ${
                      profile.is_premium ? 'text-yellow-400' : 'text-white group-hover:text-gray-400'
                    }`}>
                      {profile.is_premium ? 'Premium' : 'Basic'}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                    profile.is_premium 
                      ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20' 
                      : 'bg-gradient-to-br from-gray-500/20 to-gray-600/20'
                  }`}>
                    <Crown className={`w-6 h-6 ${profile.is_premium ? 'text-yellow-400' : 'text-gray-400'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-green-400" />
                    </div>
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                                         <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl">
                       <Mail className="w-4 h-4 text-gray-400" />
                       <div>
                         <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                         <p className="text-white font-medium">{profile.email}</p>
                       </div>
                     </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Name</p>
                        <p className="text-white font-medium">{profile.nama}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                      <Heart className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Gender</p>
                        <p className="text-white font-medium">{getGenderText(profile.gender)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Birth Place</p>
                        <p className="text-white font-medium">{profile.tempat_lahir}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Birth Date</p>
                        <p className="text-white font-medium">{formatDate(profile.tanggal_lahir)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">City</p>
                        <p className="text-white font-medium">{profile.kota_asal}</p>
                      </div>
                    </div>

                                         <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-500/20">
                       <Star className="w-4 h-4 text-green-400" />
                       <div>
                         <p className="text-xs text-green-400 uppercase tracking-wider">Roles</p>
                         <p className="text-white font-medium">{getRoles()}</p>
                       </div>
                     </div>

                    {profile.kontak && (
                      <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Contact</p>
                          <p className="text-white font-medium">{profile.kontak}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-6">
                  <CardTitle className="text-white flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center mr-3">
                      <Zap className="w-4 h-4 text-blue-400" />
                    </div>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!profile.is_label && (
                      <>
                                                 <Button 
                           className="h-16 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 justify-start px-6"
                           onClick={() => router.push('/playlist')}
                         >
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                            <Library className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold">My Playlists</div>
                            <div className="text-xs opacity-80">Manage your music collections</div>
                          </div>
                        </Button>

                        <Button 
                          className="h-16 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 justify-start px-6"
                          onClick={() => router.push('/search')}
                        >
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                            <Music className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold">Discover Music</div>
                            <div className="text-xs opacity-80">Find new songs and artists</div>
                          </div>
                        </Button>

                        <Button 
                          className="h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 justify-start px-6"
                          onClick={() => router.push('/chart')}
                        >
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold">View Charts</div>
                            <div className="text-xs opacity-80">See trending music</div>
                          </div>
                        </Button>
                      </>
                    )}

                    {(profile.is_artist || profile.is_songwriter) && (
                      <>
                        <Button 
                          className="h-16 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 justify-start px-6"
                          onClick={() => router.push('/album')}
                        >
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                            <Album className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold">Manage Albums</div>
                            <div className="text-xs opacity-80">Create and edit your albums</div>
                          </div>
                        </Button>

                        <Button 
                          className="h-16 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 justify-start px-6"
                          onClick={() => router.push('/royalty')}
                        >
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold">Check Royalties</div>
                            <div className="text-xs opacity-80">View your earnings</div>
                          </div>
                        </Button>
                      </>
                    )}

                    {profile.is_podcaster && (
                      <Button 
                        className="h-16 bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 justify-start px-6"
                        onClick={() => router.push('/podcast')}
                      >
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                          <Mic className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">Manage Podcasts</div>
                          <div className="text-xs opacity-80">Create and edit your podcasts</div>
                        </div>
                      </Button>
                    )}

                    {profile.is_label && (
                      <Button 
                        className="h-16 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 justify-start px-6"
                        onClick={() => router.push('/label-album')}
                      >
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                          <Album className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">Label Albums</div>
                          <div className="text-xs opacity-80">Manage your label's albums</div>
                        </div>
                      </Button>
                    )}

                    {!profile.is_premium && (
                      <Button 
                        className="h-16 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 justify-start px-6"
                        onClick={() => router.push('/subscription')}
                      >
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                          <Crown className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">Upgrade to Premium</div>
                          <div className="text-xs opacity-80">Unlock premium features</div>
                        </div>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 