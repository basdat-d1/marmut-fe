"use client"

import { useEffect, useState } from 'react'
import { useAuth, useToast } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { royaltyAPI } from '@/lib/api'
import { 
  DollarSign, 
  Music, 
  Download,
  Play,
  BarChart3,
  RefreshCw,
  Plus
} from 'lucide-react'

interface RoyaltyData {
  total_royalty: number
  total_play: number
  total_download: number
  songs: SongRoyalty[]
}

interface SongRoyalty {
  id_konten: string
  judul: string
  album_judul: string
  total_play: number
  total_download: number
  royalty_play: number
  royalty_download: number
  total_royalty: number
  rate_royalti: number
}

export default function RoyaltyPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const [royaltyData, setRoyaltyData] = useState<RoyaltyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    
    if (!user.is_artist && !user.is_songwriter && !user.is_label) {
      router.push('/dashboard')
      return
    }
    
    loadRoyaltyData()
  }, [user, router])

  const loadRoyaltyData = async () => {
    try {
      setLoading(true)
      let data: any
      if (user?.is_label) {
        data = await royaltyAPI.getLabelRoyalties()
      } else {
        data = await royaltyAPI.getRoyalties()
      }
      setRoyaltyData(data)
    } catch (error) {
      showToast('Failed to load royalty information', 'error')
      console.error('Error loading royalty data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateRoyaltyData = async () => {
    try {
      setUpdating(true)
      await royaltyAPI.updateRoyalties()
      showToast('Royalty information updated successfully', 'success')
      await loadRoyaltyData()
    } catch (error) {
      showToast('Failed to update royalty information', 'error')
      console.error('Error updating royalty data:', error)
    } finally {
      setUpdating(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading royalty data...</p>
        </div>
      </div>
    )
  }

  if (royaltyData && (royaltyData as any).error) {
    const errorMsg = (royaltyData as any).error;
    if (errorMsg === 'User has no songs as artist or songwriter') {
      // Empty state persis seperti Card album kosong, beri margin top agar tidak mepet navbar
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col">
          <div className="max-w-6xl mx-auto w-full mt-12 md:mt-16">
            <div className="flex items-center justify-between mb-8 mt-0">
              <div>
                <h1 className="text-4xl font-extrabold text-white mb-1">My Royalties</h1>
                <p className="text-gray-400 text-lg">Manage your royalty earnings</p>
              </div>
              <a href="/album">
                <Button className="btn-spotify px-8 py-3 text-lg font-bold rounded-full flex items-center gap-2">
                  <Plus className="w-5 h-5 mr-2" />
                  CREATE SONG
                </Button>
              </a>
            </div>
            <Card className="bg-gray-900/80 border-0 shadow-md">
              <CardContent className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Music className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Anda Belum Memiliki Lagu Royalti</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">Mulai membuat lagu pertama Anda untuk mendapatkan royalti di Marmut.</p>
                <a href="/album">
                  <Button className="btn-spotify px-8 py-3 text-lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Buat Lagu Pertama
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">{errorMsg}</h2>
          <p className="text-gray-400">Silakan coba dengan akun lain atau tambahkan lagu sebagai artist/songwriter.</p>
        </div>
      </div>
    )
  }

  const songs: SongRoyalty[] = Array.isArray(royaltyData?.songs) ? royaltyData.songs : [];

  // Show empty state if no songs
  if (songs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="bg-[#181e29] rounded-2xl shadow-lg mx-auto p-10 flex flex-col items-center max-w-xl w-full">
          <div className="flex flex-col items-center">
            <div className="bg-green-900/20 rounded-full p-6 mb-6">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-400">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-2v13" />
                <circle cx="6" cy="18" r="3" fill="currentColor" />
                <circle cx="18" cy="16" r="3" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Anda Belum Memiliki Lagu Royalti</h2>
            <p className="text-gray-400 mb-6 text-center">Mulai membuat lagu pertama Anda untuk mengorganisir karya musik Anda di Marmut.</p>
            <a href="/album">
              <button className="bg-green-400 hover:bg-green-500 text-black font-bold py-3 px-8 rounded-full text-lg flex items-center transition-all">
                <span className="text-2xl mr-2">+</span> BUAT LAGU PERTAMA
              </button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">List Royalti</h1>
              <p className="text-gray-400">Riwayat royalti berdasarkan lagu karya Anda</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={updateRoyaltyData}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {updating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Memperbarui...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Perbarui Royalti
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {royaltyData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gray-900/80 border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Royalti</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    {formatCurrency(royaltyData.total_royalty)}
                  </div>
                  <p className="text-xs text-gray-400">
                    Total pendapatan dari royalti
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/80 border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Play</CardTitle>
                  <Play className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">
                    {formatNumber(royaltyData.total_play)}
                  </div>
                  <p className="text-xs text-gray-400">
                    Total pemutaran lagu
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/80 border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Download</CardTitle>
                  <Download className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">
                    {formatNumber(royaltyData.total_download)}
                  </div>
                  <p className="text-xs text-gray-400">
                    Total unduhan lagu
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Royalty Table */}
            <Card className="bg-gray-900/80 border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
                  Riwayat Royalti
                </CardTitle>
              </CardHeader>
              <CardContent>
                {songs.length === 0 ? (
                  <div className="text-center py-8">
                    <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Tidak Ada Data Royalti</h3>
                    <p className="text-gray-400">Anda belum memiliki pendapatan royalti.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3 px-4 font-medium text-gray-400">Judul Lagu</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-400">Judul Album</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-400">Total Play</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-400">Total Download</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-400">Total Royalti Didapat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {songs.map((song) => (
                          <tr key={song.id_konten} className="border-b border-gray-800 hover:bg-gray-800/30">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-white">{song.judul}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="text-gray-300">{song.album_judul}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right text-gray-300">
                              {formatNumber(song.total_play)}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-300">
                              {formatNumber(song.total_download)}
                            </td>
                            <td className="py-3 px-4 text-right text-green-400 font-bold">
                              {formatCurrency(song.total_royalty)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
} 