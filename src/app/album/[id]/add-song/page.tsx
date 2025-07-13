"use client"

import { useEffect, useState } from 'react'
import { useAuth, useToast } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { albumAPI } from '@/lib/api'
import { 
  ArrowLeft,
  Music
} from 'lucide-react'
import Select, { SingleValue, MultiValue } from 'react-select'

interface Album {
  id: string
  judul: string
  label: string
}

type OptionType = { value: string; label: string }

export default function AddSongPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const params = useParams()
  const albumId = params.id as string
  
  const [album, setAlbum] = useState<Album | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [artistOptions, setArtistOptions] = useState<OptionType[]>([])
  const [songwriterOptions, setSongwriterOptions] = useState<OptionType[]>([])
  const [genreOptions, setGenreOptions] = useState<OptionType[]>([])
  
  const [songForm, setSongForm] = useState<{
    judul: string
    durasi: string
    artist: OptionType | null
    songwriters: OptionType[]
    genres: OptionType[]
  }>({
    judul: '',
    durasi: '',
    artist: null,
    songwriters: [],
    genres: []
  })

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    
    if (!user.is_artist && !user.is_songwriter) {
      router.push('/dashboard')
      return
    }
    
    if (albumId) {
      loadData()
    }
  }, [user, router, albumId])

  // Auto-fill songwriter when user is songwriter and options are loaded
  useEffect(() => {
    if (user?.is_songwriter && songwriterOptions.length > 0) {
      const currentSongwriterOption = songwriterOptions.find(s => s.label === user.nama)
      if (currentSongwriterOption && songForm.songwriters.length === 0) {
        setSongForm(prev => ({
          ...prev,
          songwriters: [currentSongwriterOption]
        }))
      }
    }
  }, [user, songwriterOptions])

  const loadData = async () => {
    if (!albumId) return
    
    setLoading(true)
    try {
      const [albumResponse, artists, songwriters, genres] = await Promise.all([
        albumAPI.getAlbumDetail(albumId),
        albumAPI.getAllArtists(),
        albumAPI.getAllSongwriters(),
        albumAPI.getAllGenres()
      ])
      
      setAlbum(albumResponse.album)
      setArtistOptions((artists.artists || []).map((a: any) => ({ value: a.id, label: a.nama })))
      setSongwriterOptions((songwriters.songwriters || []).map((s: any) => ({ value: s.id, label: s.nama })))
      setGenreOptions((genres.genres || []).map((g: string) => ({ value: g, label: g })))
    } catch (error) {
      showToast('Failed to load data', 'error')
      router.push('/album')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const currentArtistOption = user?.is_artist ? artistOptions.find(a => a.label === user.nama) : null
    const hasValidArtist = user?.is_artist ? !!currentArtistOption : !!songForm.artist
    const durasiInt = parseInt(songForm.durasi)
    
    if (!songForm.judul || !durasiInt || !hasValidArtist || songForm.songwriters.length === 0 || songForm.genres.length === 0) {
      showToast('Please fill all required fields', 'error')
      return
    }
    
    setSubmitting(true)
    try {
      await albumAPI.addSong(albumId, {
        judul: songForm.judul,
        durasi: durasiInt,
        artist_id: user?.is_artist && currentArtistOption ? currentArtistOption.value : songForm.artist?.value || '',
        songwriter_ids: songForm.songwriters.map(sw => sw.value),
        genres: songForm.genres.map(g => g.value),
        album_id: albumId
      })
      
      showToast('Song added successfully!', 'success')
      router.push(`/album/${albumId}`)
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Failed to add song', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const selectStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: '#23272a',
      borderColor: '#374151',
      color: '#fff',
      minHeight: 40,
      boxShadow: 'none',
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: '#23272a',
      color: '#fff',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#059669'
        : state.isFocused
        ? '#374151'
        : '#23272a',
      color: '#fff',
      cursor: 'pointer',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#fff',
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: '#374151',
      color: '#fff',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: '#fff',
    }),
    input: (provided: any) => ({
      ...provided,
      color: '#fff',
    }),
  }

  if (!user?.is_artist && !user?.is_songwriter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-400">Only artists and songwriters can access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Album Not Found</h1>
          <p className="text-gray-400 mb-4">The album you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/album')} className="btn-spotify">
            Back to Albums
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/album/${albumId}`)}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Album
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Add Song</h1>
              <p className="text-gray-400">Add a new song to "{album.judul}"</p>
            </div>
          </div>
        </div>

        {/* Add Song Form */}
        <Card className="bg-gray-900/80 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Music className="w-5 h-5 mr-2 text-green-400" />
              Song Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Judul Lagu</label>
                  <Input
                    type="text"
                    value={songForm.judul}
                    onChange={e => setSongForm(prev => ({ ...prev, judul: e.target.value }))}
                    placeholder="Masukkan judul lagu"
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Durasi (menit)</label>
                  <Input
                    type="number"
                    min="1"
                    value={songForm.durasi}
                    onChange={e => setSongForm(prev => ({ ...prev, durasi: e.target.value }))}
                    placeholder="Masukkan durasi lagu dalam menit"
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Artist</label>
                  {user?.is_artist ? (
                    <Input
                      type="text"
                      value={user.nama}
                      disabled
                      className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500 cursor-not-allowed"
                    />
                  ) : (
                    <Select
                      value={songForm.artist}
                      onChange={(option: SingleValue<OptionType>) => setSongForm(prev => ({ ...prev, artist: option || null }))}
                      options={artistOptions}
                      placeholder="Pilih artist"
                      isClearable
                      styles={selectStyles}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Songwriter</label>
                  <Select
                    value={songForm.songwriters}
                    onChange={(options: MultiValue<OptionType>) => setSongForm(prev => ({ ...prev, songwriters: options as OptionType[] }))}
                    options={songwriterOptions}
                    isMulti
                    placeholder="Pilih songwriter"
                    styles={selectStyles}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {genreOptions.map((g) => (
                      <label key={g.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={songForm.genres.some(selected => selected.value === g.value)}
                          onChange={() => {
                            setSongForm(prev => {
                              const exists = prev.genres.some(selected => selected.value === g.value)
                              return {
                                ...prev,
                                genres: exists
                                  ? prev.genres.filter(selected => selected.value !== g.value)
                                  : [...prev.genres, g]
                              }
                            })
                          }}
                          className="rounded border-gray-300 bg-gray-800 text-green-500 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-300">{g.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <Button 
                  type="submit" 
                  className="btn-spotify"
                  disabled={submitting}
                >
                  {submitting ? 'Adding Song...' : 'Add Song'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-gray-600 text-white hover:bg-gray-800"
                  onClick={() => router.push(`/album/${albumId}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 