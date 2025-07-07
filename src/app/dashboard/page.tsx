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
  TrendingUp
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
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-gray-400 mb-4">{error || 'Failed to load profile'}</p>
          <Button 
            onClick={() => router.push('/')}
            className="btn-spotify"
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
    if (roles.length === 0) roles.push('Regular User')
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {profile.nama}!</h1>
          <p className="text-gray-400">Here's what's happening with your account</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Email</label>
                  <p className="text-white">{profile.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Name</label>
                  <p className="text-white">{profile.nama}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Gender</label>
                  <p className="text-white">{getGenderText(profile.gender)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Birth Place</label>
                  <p className="text-white">{profile.tempat_lahir}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Birth Date</label>
                  <p className="text-white">{formatDate(profile.tanggal_lahir)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">City</label>
                  <p className="text-white">{profile.kota_asal}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Roles</label>
                  <p className="text-white">{getRoles()}</p>
                </div>
                {profile.kontak && (
                  <div>
                    <label className="text-sm font-medium text-gray-400">Contact</label>
                    <p className="text-white">{profile.kontak}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Statistics Cards */}
              {!profile.is_label && (
                <>
                  <Card className="bg-gray-900/50 border-gray-800 hover:border-green-500/50 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Library className="w-8 h-8 text-green-400 mr-4" />
                        <div>
                          <p className="text-sm text-gray-400">Playlists</p>
                          <p className="text-2xl font-bold text-white">{profile.playlists?.length || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {(profile.is_artist || profile.is_songwriter) && (
                    <Card className="bg-gray-900/50 border-gray-800 hover:border-green-500/50 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <Album className="w-8 h-8 text-green-400 mr-4" />
                          <div>
                            <p className="text-sm text-gray-400">Albums</p>
                            <p className="text-2xl font-bold text-white">{profile.albums?.length || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {profile.is_podcaster && (
                    <Card className="bg-gray-900/50 border-gray-800 hover:border-green-500/50 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <Mic className="w-8 h-8 text-green-400 mr-4" />
                          <div>
                            <p className="text-sm text-gray-400">Podcasts</p>
                            <p className="text-2xl font-bold text-white">{profile.podcasts?.length || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* Premium Status */}
              <Card className={`border-gray-800 hover:border-green-500/50 transition-all ${
                profile.is_premium ? 'bg-gradient-to-br from-green-900/50 to-green-800/50' : 'bg-gray-900/50'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Crown className={`w-8 h-8 mr-4 ${profile.is_premium ? 'text-yellow-400' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-sm text-gray-400">Subscription</p>
                      <p className="text-2xl font-bold text-white">
                        {profile.is_premium ? 'Premium' : 'Basic'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {!profile.is_label && (
                    <>
                      <Button 
                        className="btn-spotify justify-start"
                        onClick={() => router.push('/playlist')}
                      >
                        <Library className="w-4 h-4 mr-2" />
                        My Playlists
                      </Button>

                      <Button 
                        className="btn-spotify justify-start"
                        onClick={() => router.push('/search')}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Discover Music
                      </Button>

                      <Button 
                        className="btn-spotify justify-start"
                        onClick={() => router.push('/chart')}
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        View Charts
                      </Button>
                    </>
                  )}

                  {(profile.is_artist || profile.is_songwriter) && (
                    <>
                      <Button 
                        className="btn-spotify justify-start"
                        onClick={() => router.push('/album')}
                      >
                        <Album className="w-4 h-4 mr-2" />
                        Manage Albums
                      </Button>

                      <Button 
                        className="btn-spotify justify-start"
                        onClick={() => router.push('/royalty')}
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Check Royalties
                      </Button>
                    </>
                  )}

                  {profile.is_podcaster && (
                    <Button 
                      className="btn-spotify justify-start"
                      onClick={() => router.push('/podcast')}
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Manage Podcasts
                    </Button>
                  )}

                  {profile.is_label && (
                    <Button 
                      className="btn-spotify justify-start"
                      onClick={() => router.push('/label-album')}
                    >
                      <Album className="w-4 h-4 mr-2" />
                      Label Albums
                    </Button>
                  )}

                  {!profile.is_premium && (
                    <Button 
                      className="btn-spotify justify-start"
                      onClick={() => router.push('/subscription')}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 