"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useToast } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Select, { SingleValue, MultiValue } from 'react-select'
import { albumAPI } from '@/lib/api'
import { Plus, Music } from 'lucide-react'

interface OptionType { value: string; label: string }

export default function CreateSongPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [albumOptions, setAlbumOptions] = useState<OptionType[]>([])
  const [artistOptions, setArtistOptions] = useState<OptionType[]>([])
  const [songwriterOptions, setSongwriterOptions] = useState<OptionType[]>([])
  const [genreOptions, setGenreOptions] = useState<OptionType[]>([])
  const [form, setForm] = useState({
    judul: '',
    durasi: '',
    album: null as OptionType | null,
    artist: null as OptionType | null,
    songwriters: [] as OptionType[],
    genres: [] as OptionType[],
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return
    if (!user.is_artist && !user.is_songwriter) {
      router.push('/dashboard')
      return
    }
    loadOptions()
  }, [user])

  const loadOptions = async () => {
    setLoading(true)
    try {
      const [albums, artists, songwriters, genres] = await Promise.all([
        albumAPI.getUserAlbums(),
        albumAPI.getAllArtists(),
        albumAPI.getAllSongwriters(),
        albumAPI.getAllGenres(),
      ])
      setAlbumOptions((albums.albums || []).map((a: any) => ({ value: a.id, label: a.judul })))
      setArtistOptions((artists.artists || []).map((a: any) => ({ value: a.id, label: a.nama })))
      setSongwriterOptions((songwriters.songwriters || []).map((s: any) => ({ value: s.id, label: s.nama })))
      setGenreOptions((genres.genres || []).map((g: string) => ({ value: g, label: g })))
    } catch {
      showToast('Gagal memuat data form', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.judul || !form.durasi || !form.album || !form.artist || form.songwriters.length === 0 || form.genres.length === 0) {
      showToast('Semua field wajib diisi', 'error')
      return
    }
    setSubmitting(true)
    try {
      await albumAPI.addSong(form.album.value, {
        judul: form.judul,
        durasi: parseInt(form.durasi),
        artist_id: form.artist.value,
        songwriter_ids: form.songwriters.map(sw => sw.value),
        genres: form.genres.map(g => g.value),
        album_id: form.album.value,
      })
      showToast('Lagu berhasil dibuat!', 'success')
      router.push('/album')
    } catch (error: any) {
      showToast(error.message || 'Gagal membuat lagu', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user?.is_artist && !user?.is_songwriter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-400">Only artists and songwriters can create songs.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gray-900/80 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Music className="w-7 h-7 text-green-400" />
            Create Song
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Judul Lagu</label>
              <Input
                type="text"
                value={form.judul}
                onChange={e => setForm(f => ({ ...f, judul: e.target.value }))}
                placeholder="Masukkan judul lagu"
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Durasi (menit)</label>
              <Input
                type="number"
                min={1}
                value={form.durasi}
                onChange={e => setForm(f => ({ ...f, durasi: e.target.value }))}
                placeholder="Masukkan durasi lagu dalam menit"
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Album</label>
              <Select
                value={form.album}
                onChange={(option: SingleValue<OptionType>) => setForm(f => ({ ...f, album: option || null }))}
                options={albumOptions}
                placeholder="Pilih album"
                isClearable
                isDisabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Artist</label>
              <Select
                value={form.artist}
                onChange={(option: SingleValue<OptionType>) => setForm(f => ({ ...f, artist: option || null }))}
                options={artistOptions}
                placeholder="Pilih artist"
                isClearable
                isDisabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Songwriter(s)</label>
              <Select
                value={form.songwriters}
                onChange={(options: MultiValue<OptionType>) => setForm(f => ({ ...f, songwriters: options as OptionType[] }))}
                options={songwriterOptions}
                placeholder="Pilih songwriter"
                isMulti
                isDisabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Genre(s)</label>
              <Select
                value={form.genres}
                onChange={(options: MultiValue<OptionType>) => setForm(f => ({ ...f, genres: options as OptionType[] }))}
                options={genreOptions}
                placeholder="Pilih genre"
                isMulti
                isDisabled={loading}
              />
            </div>
            <Button type="submit" className="btn-spotify w-full py-3 text-lg font-bold flex items-center justify-center gap-2" disabled={submitting || loading}>
              <Plus className="w-5 h-5 mr-2" />
              {submitting ? 'Membuat Lagu...' : 'Buat Lagu'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 