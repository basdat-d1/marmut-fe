"use client"

import { useEffect, useState } from 'react'
import { useAuth, useToast } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { albumAPI } from '@/lib/api'
import { 
  Plus, 
  Music, 
  Trash2,
  PlusCircle,
  Eye
} from 'lucide-react'
import Select, { SingleValue, MultiValue } from 'react-select'
import Modal from 'react-modal'

interface Album {
  id: string
  judul: string
  label: string
  jumlah_lagu: number
  total_durasi: number
  tanggal_rilis: string
  songs: Song[]
}

interface Song {
  id: string
  judul: string
  durasi: number
  tanggal_rilis: string
  total_play: number
  total_download: number
}

export default function AlbumPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showSongForm, setShowSongForm] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [labelOptions, setLabelOptions] = useState<any[]>([])
  const [artistOptions, setArtistOptions] = useState<any[]>([])
  const [songwriterOptions, setSongwriterOptions] = useState<any[]>([])
  const [genreOptions, setGenreOptions] = useState<any[]>([])

  // Updated forms to use IDs
  type OptionType = { value: string; label: string }
  const [createForm, setCreateForm] = useState<{ judul: string; label: OptionType | null }>({
    judul: '',
    label: null
  })
  const [songForm, setSongForm] = useState<{
    judul: string
    durasi: number
    artist: OptionType | null
    songwriters: OptionType[]
    genres: OptionType[]
  }>({
    judul: '',
    durasi: 0,
    artist: null,
    songwriters: [],
    genres: []
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null)
  


  // Add modal state for create album+first song
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false)
  const [firstSongForm, setFirstSongForm] = useState<{
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
    
    loadAlbums()
    loadFormOptions()
  }, [user, router])

  // Auto-fill songwriter when user is songwriter and options are loaded
  useEffect(() => {
    if (user?.is_songwriter && songwriterOptions.length > 0) {
      const currentSongwriterOption = songwriterOptions.find(s => s.label === user.nama)
      if (currentSongwriterOption) {
        // Auto-fill in both forms if they're empty
        setSongForm(prev => ({
          ...prev,
          songwriters: prev.songwriters.length === 0 ? [currentSongwriterOption] : prev.songwriters
        }))
        setFirstSongForm(prev => ({
          ...prev,
          songwriters: prev.songwriters.length === 0 ? [currentSongwriterOption] : prev.songwriters
        }))
      }
    }
  }, [user, songwriterOptions])

  const loadAlbums = async () => {
    try {
      const data = await albumAPI.getUserAlbums()
      setAlbums(data.albums || [])
    } catch (error) {
      showToast('Failed to load albums', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadFormOptions = async () => {
    try {
      const [labels, artists, songwriters, genres] = await Promise.all([
        albumAPI.getAllLabels(),
        albumAPI.getAllArtists(),
        albumAPI.getAllSongwriters(),
        albumAPI.getAllGenres()
      ])
      setLabelOptions((labels.labels || []).map((l: any) => ({ value: l.id, label: l.nama })))
      setArtistOptions((artists.artists || []).map((a: any) => ({ value: a.id, label: a.nama })))
      setSongwriterOptions((songwriters.songwriters || []).map((s: any) => ({ value: s.id, label: s.nama })))
      setGenreOptions((genres.genres || []).map((g: string) => ({ value: g, label: g })))
    } catch (e) {
      showToast('Failed to load form options', 'error')
    }
  }

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAlbum) return
    
    const currentArtistOption = user?.is_artist ? artistOptions.find(a => a.label === user.nama) : null
    const hasValidArtist = user?.is_artist ? !!currentArtistOption : !!songForm.artist
    
    if (!songForm.judul || !songForm.durasi || !hasValidArtist || songForm.songwriters.length === 0 || songForm.genres.length === 0) {
      showToast('Please fill all required fields', 'error')
      return
    }
    try {
      await albumAPI.addSong(selectedAlbum.id, {
        judul: songForm.judul,
        durasi: songForm.durasi,
        artist_id: user?.is_artist && currentArtistOption ? currentArtistOption.value : songForm.artist?.value,
        songwriter_ids: songForm.songwriters.map(sw => sw.value),
        genres: songForm.genres.map(g => g.value),
        album_id: selectedAlbum.id
      })
      setSongForm({ judul: '', durasi: 0, artist: null, songwriters: [], genres: [] })
      setShowSongForm(false)
      setSelectedAlbum(null)
      await loadAlbums()
      showToast('Song added successfully!', 'success')
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Failed to add song', 'error')
    }
  }

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault()
    // Autofill artist jika user artist dan field kosong
    let artistField = firstSongForm.artist
    if (!artistField && user?.is_artist && artistOptions.length > 0) {
      const autoArtist = artistOptions.find(a => a.label === user.nama)
      artistField = autoArtist || null
    }
    // Pastikan durasi integer, default '' jika undefined
    const durasiStr = String(firstSongForm.durasi ?? '')
    const durasiInt = parseInt(durasiStr)
    
    if (!createForm.judul || !createForm.label || !firstSongForm.judul || !durasiInt || !artistField || firstSongForm.songwriters.length === 0 || firstSongForm.genres.length === 0) {
      showToast('Semua field wajib diisi', 'error')
      return
    }
    try {
      // 1. Create album
      const albumRes = await albumAPI.createAlbum({
        judul_album: createForm.judul,
        label_id: createForm.label.value
      })
      
      const album_id = albumRes.album_id
      
      // 2. Create first song
      const songPayload = {
        judul: firstSongForm.judul,
        durasi: durasiInt,
        artist_id: artistField?.value || '',
        songwriter_ids: firstSongForm.songwriters.map(sw => sw.value),
        genres: firstSongForm.genres.map(g => g.value),
        album_id
      }
      
      await albumAPI.addSong(album_id, songPayload)
      
      // 3. Reset forms and close modal
      setCreateForm({ judul: '', label: null })
      setFirstSongForm({ judul: '', durasi: '', artist: null, songwriters: [], genres: [] })
      setShowCreateAlbumModal(false)
      await loadAlbums()
      showToast('Album & lagu pertama berhasil dibuat!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Gagal membuat album/lagu', 'error')
    }
  }

  const handleDeleteAlbum = async (albumId: string) => {
    try {
      await albumAPI.deleteAlbum(albumId)
      await loadAlbums()
      showToast('Album deleted successfully!', 'success')
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Failed to delete album', 'error')
    }
  }

  const handleDeleteConfirm = async () => {
    if (albumToDelete) {
      await handleDeleteAlbum(albumToDelete.id)
      setAlbumToDelete(null)
    }
    setShowDeleteConfirm(false)
  }

  const handleViewSongs = (album: Album) => {
    router.push(`/album/${album.id}`)
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
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
          <p className="mt-4 text-gray-400">Loading albums...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Albums</h1>
              <p className="text-gray-400">Manage your album content</p>
            </div>
            <Button className="btn-spotify" onClick={() => setShowCreateAlbumModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Album
            </Button>
          </div>
        </div>

        {/* Create Album Modal */}
        <Modal
          isOpen={showCreateAlbumModal}
          onRequestClose={() => setShowCreateAlbumModal(false)}
          className="bg-gray-900 p-8 rounded-lg w-full max-w-3xl mx-auto mt-8 shadow-lg border border-gray-700"
          overlayClassName="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
          ariaHideApp={false}
        >
          <h2 className="text-xl font-bold text-white mb-4">Create Album & Lagu Pertama</h2>
          <form
            onSubmit={handleCreateAlbum}
            className="space-y-4"
          >
                <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Judul Album</label>
                  <Input
                    type="text"
                    value={createForm.judul}
                onChange={e => setCreateForm(prev => ({ ...prev, judul: e.target.value }))}
                placeholder="Masukkan judul album"
                    className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                    required
                  />
                </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Label</label>
              <Select
                value={createForm.label}
                onChange={(option: SingleValue<OptionType>) => setCreateForm(prev => ({ ...prev, label: option || null }))}
                options={labelOptions}
                placeholder="Pilih label"
                isClearable
                styles={selectStyles}
              />
            </div>
            <hr className="my-4 border-gray-700" />
            <h3 className="text-lg font-semibold text-white mb-2">Lagu Pertama</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Judul Lagu</label>
                <Input
                  type="text"
                  value={firstSongForm.judul}
                  onChange={e => setFirstSongForm(prev => ({ ...prev, judul: e.target.value }))}
                  placeholder="Masukkan judul lagu"
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Durasi (menit)</label>
                <Input
                  type="text"
                  value={firstSongForm.durasi}
                  onChange={e => setFirstSongForm(prev => ({ ...prev, durasi: e.target.value }))}
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
                    value={firstSongForm.artist}
                    onChange={(option: SingleValue<OptionType>) => setFirstSongForm(prev => ({ ...prev, artist: option || null }))}
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
                  value={firstSongForm.songwriters}
                  onChange={(options: MultiValue<OptionType>) => setFirstSongForm(prev => ({ ...prev, songwriters: options as OptionType[] }))}
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
                        checked={firstSongForm.genres.some(selected => selected.value === g.value)}
                        onChange={() => {
                          setFirstSongForm(prev => {
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
            <div className="flex space-x-2 pt-2">
              <Button type="submit" className="btn-spotify">Submit</Button>
              <Button type="button" variant="outline" className="border-gray-600 text-white hover:bg-gray-800" onClick={() => setShowCreateAlbumModal(false)}>Cancel</Button>
                </div>
              </form>
        </Modal>

        {/* Add Song Form */}
        {showSongForm && selectedAlbum && (
          <Modal
            isOpen={showSongForm && !!selectedAlbum}
            onRequestClose={() => {
              setShowSongForm(false)
              setSongForm({ judul: '', durasi: 0, artist: null, songwriters: [], genres: [] })
              setSelectedAlbum(null)
            }}
            className="bg-gray-900 p-8 rounded-lg w-full max-w-2xl mx-auto mt-8 shadow-lg border border-gray-700"
            overlayClassName="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
            ariaHideApp={false}
          >
            <h2 className="text-xl font-bold text-white mb-4">Tambah Lagu ke "{selectedAlbum?.judul}"</h2>
              <form onSubmit={handleAddSong} className="space-y-4">
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
                    type="text"
                    value={songForm.durasi === 0 ? '' : songForm.durasi}
                    onChange={e => setSongForm(prev => ({ ...prev, durasi: parseInt(e.target.value) || 0 }))}
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
              <div className="flex space-x-2 pt-2">
                <Button type="submit" className="btn-spotify">Tambah Lagu</Button>
                <Button type="button" variant="outline" className="border-gray-600 text-white hover:bg-gray-800" onClick={() => {
                  setShowSongForm(false)
                  setSongForm({ judul: '', durasi: 0, artist: null, songwriters: [], genres: [] })
                  setSelectedAlbum(null)
                }}>Cancel</Button>
                </div>
              </form>
          </Modal>
        )}

        {/* Albums Table or Empty State */}
        {albums.length === 0 ? (
          <Card className="bg-gray-900/80 border-0 shadow-md">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Music className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Anda Belum Memiliki Album</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">Mulai membuat album pertama Anda untuk mengorganisir karya musik Anda di Marmut.</p>
              <Button 
                onClick={() => setShowCreateAlbumModal(true)}
                className="btn-spotify px-8 py-3 text-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Buat Album Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-900/80 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Music className="w-5 h-5 mr-2 text-green-400" />
                List Album
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Judul</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Label</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Jumlah Lagu</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Durasi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
            {albums.map((album) => (
                      <tr key={album.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{album.judul}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{album.label}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{album.jumlah_lagu}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{formatDuration(album.total_durasi)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-row items-center space-x-2">
                            <Button size="sm" className="w-10 h-10 rounded-full flex items-center justify-center mx-1" title="Lihat Daftar Lagu" onClick={() => handleViewSongs(album)}>
                              <Eye className="w-6 h-6" />
                            </Button>
                            <Button size="sm" className="w-10 h-10 rounded-full flex items-center justify-center mx-1" title="Tambah Lagu" onClick={() => { setSelectedAlbum(album); setShowSongForm(true); }}>
                              <PlusCircle className="w-6 h-6" />
                    </Button>
                            <Button size="sm" variant="outline" className="w-10 h-10 rounded-full flex items-center justify-center mx-1 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent" title="Hapus" onClick={() => { setAlbumToDelete(album); setShowDeleteConfirm(true); }}>
                              <Trash2 className="w-6 h-6" />
                    </Button>
                          </div>
                        </td>
                      </tr>
                        ))}
                  </tbody>
                </table>
                    </div>
                </CardContent>
              </Card>
        )}



        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false)
            setAlbumToDelete(null)
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Album"
          message={`Are you sure you want to delete "${albumToDelete?.judul}"? This action cannot be undone.`}
          type="delete"
          confirmText="Delete Album"
        />
      </div>
    </div>
  )
}