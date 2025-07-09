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
  BarChart3
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
  total_play: number
  total_download: number
  royalty_play: number
  royalty_download: number
  total_royalty: number
}

export default function RoyaltyPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const [royaltyData, setRoyaltyData] = useState<RoyaltyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('all') // all, month, year

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
  }, [user, router, timeRange])

  const loadRoyaltyData = async () => {
    try {
      let data: any
      if (user?.is_label) {
        data = await royaltyAPI.getLabelRoyalties()
      } else {
        data = await royaltyAPI.getRoyalties()
      }
      setRoyaltyData(data)
    } catch (error) {
      showToast('Failed to load royalty information', 'error')
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Royalty Dashboard</h1>
              <p className="text-gray-400">Track your earnings from music royalties</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant={timeRange === 'all' ? 'default' : 'outline'}
                onClick={() => setTimeRange('all')}
                className={timeRange === 'all' ? 'btn-spotify' : 'border-gray-700 text-white hover:bg-gray-800'}
              >
                All Time
              </Button>
              <Button 
                variant={timeRange === 'year' ? 'default' : 'outline'}
                onClick={() => setTimeRange('year')}
                className={timeRange === 'year' ? 'btn-spotify' : 'border-gray-700 text-white hover:bg-gray-800'}
              >
                This Year
              </Button>
              <Button 
                variant={timeRange === 'month' ? 'default' : 'outline'}
                onClick={() => setTimeRange('month')}
                className={timeRange === 'month' ? 'btn-spotify' : 'border-gray-700 text-white hover:bg-gray-800'}
              >
                This Month
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
                  <CardTitle className="text-sm font-medium text-white">Total Royalty</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    {formatCurrency(royaltyData.total_royalty)}
                  </div>
                  <p className="text-xs text-gray-400">
                    Total earnings from royalties
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/80 border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Plays</CardTitle>
                  <Play className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">
                    {formatNumber(royaltyData.total_play)}
                  </div>
                  <p className="text-xs text-gray-400">
                    Total song plays
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/80 border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Downloads</CardTitle>
                  <Download className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">
                    {formatNumber(royaltyData.total_download)}
                  </div>
                  <p className="text-xs text-gray-400">
                    Total song downloads
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Songs Royalty Table */}
            <Card className="bg-gray-900/80 border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
                  Song Royalty Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {royaltyData.songs.length === 0 ? (
                  <div className="text-center py-8">
                    <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Royalty Data</h3>
                    <p className="text-gray-400">You don't have any royalty earnings yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3 px-4 font-medium text-gray-400">Song</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-400">Plays</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-400">Downloads</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-400">Play Royalty</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-400">Download Royalty</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-400">Total Royalty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {royaltyData.songs.map((song) => (
                          <tr key={song.id_konten} className="border-b border-gray-800 hover:bg-gray-800/30">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-white">{song.judul}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right text-gray-300">
                              {formatNumber(song.total_play)}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-300">
                              {formatNumber(song.total_download)}
                            </td>
                            <td className="py-3 px-4 text-right text-green-400 font-medium">
                              {formatCurrency(song.royalty_play)}
                            </td>
                            <td className="py-3 px-4 text-right text-green-400 font-medium">
                              {formatCurrency(song.royalty_download)}
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

            {/* Royalty Information */}
            <Card className="mt-6 bg-gray-900/80 border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-white">Royalty Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-white mb-2">How Royalties Work</h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Play royalty: IDR 0.01 per play</li>
                      <li>• Download royalty: IDR 0.10 per download</li>
                      <li>• Royalties are calculated monthly</li>
                      <li>• Payments are processed at the end of each month</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-2">Payment Schedule</h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Monthly royalty reports are generated</li>
                      <li>• Minimum payout: IDR 100,000</li>
                      <li>• Payment method: Bank transfer</li>
                      <li>• Processing time: 5-7 business days</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
} 