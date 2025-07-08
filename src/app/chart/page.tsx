"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { chartAPI } from '@/lib/api'
import { 
  BarChart3, 
  TrendingUp, 
  Music, 
  Eye,
  Play,
  Calendar,
  Users
} from 'lucide-react'

interface Chart {
  tipe: string
}

interface ChartSong {
  id: string
  judul: string
  artist: string
  album?: string
  total_play: number
  total_download?: number
  type?: string
}

export default function ChartPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [charts, setCharts] = useState<Chart[]>([])
  const [selectedChart, setSelectedChart] = useState<Chart | null>(null)
  const [chartSongs, setChartSongs] = useState<ChartSong[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSongs, setLoadingSongs] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    loadCharts()
  }, [user, router])

  const loadCharts = async () => {
    try {
      const data = await chartAPI.getCharts()
      // Convert chart_types to Chart objects
      const chartObjects = (data.chart_types || []).map((tipe: string) => ({
        tipe: tipe
      }))
      setCharts(chartObjects)
    } catch (error) {
      console.error('Failed to load charts:', error)
      setError('Failed to load charts')
    } finally {
      setLoading(false)
    }
  }

  const loadChartSongs = async (chart: Chart) => {
    setSelectedChart(chart)
    setLoadingSongs(true)

    try {
      const data = await chartAPI.getChartSongs(chart.tipe)
      // Handle different response formats based on chart type
      let songs: ChartSong[] = []
      if (data.items) {
        songs = data.items.map((item: any) => ({
          id: item.id,
          judul: item.judul || item.nama,
          artist: item.artist || item.creator || '',
          album: item.album || item.album_title,
          total_play: item.total_play || item.total_plays || 0,
          total_download: item.total_download,
          type: item.type
        }))
      }
      setChartSongs(songs)
    } catch (error) {
      console.error('Failed to load chart songs:', error)
      setError('Failed to load chart songs')
    } finally {
      setLoadingSongs(false)
    }
  }

  const handleViewSong = (songId: string) => {
    router.push(`/song/${songId}`)
  }

  const handlePlaySong = (songId: string) => {
    // Handle play functionality
    console.log('Playing song:', songId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading charts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Chart List</h1>
          <p className="text-gray-400">Discover the most popular music</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Charts List */}
        {!selectedChart && (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Available Charts</CardTitle>
            </CardHeader>
            <CardContent>
              {charts.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Charts Available</h3>
                  <p className="text-gray-400">There are no charts available at the moment.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Tipe
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {charts.map((chart) => (
                        <tr key={chart.tipe} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <BarChart3 className="w-5 h-5 text-green-400" />
                              <span className="text-sm font-medium text-white">{chart.tipe}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                            <Button 
                              onClick={() => loadChartSongs(chart)}
                              className="btn-spotify"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Lihat Daftar Lagu
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Chart Detail */}
        {selectedChart && (
          <div>
            {/* Back Button */}
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSelectedChart(null)
                  setChartSongs([])
                }}
                className="text-white hover:bg-gray-800"
              >
                ← Kembali
              </Button>
            </div>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Chart Detail</CardTitle>
                <p className="text-gray-400">Tipe: {selectedChart.tipe}</p>
              </CardHeader>
              <CardContent>
                {loadingSongs ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading chart songs...</p>
                  </div>
                ) : chartSongs.length === 0 ? (
                  <div className="text-center py-8">
                    <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Songs in Chart</h3>
                    <p className="text-gray-400">This chart doesn't have any songs yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800/50">
                        <tr>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                            #
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Judul Lagu
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Oleh
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Album
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Total Plays
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {chartSongs.map((song, index) => (
                          <tr key={song.id} className="hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="text-sm font-bold text-white">
                                {index + 1}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="text-sm font-medium text-white">{song.judul}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                              {song.artist}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                              {song.album || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <TrendingUp className="w-4 h-4 text-green-400" />
                                <span>{formatNumber(song.total_play)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                              <div className="flex justify-center space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-gray-700 text-white hover:bg-gray-800"
                                  onClick={() => handleViewSong(song.id)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="btn-spotify"
                                  onClick={() => handlePlaySong(song.id)}
                                >
                                  <Play className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Chart Information */}
        {!selectedChart && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Chart Stats */}
            <Card className="bg-gradient-to-br from-green-900/30 to-green-800/30 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
                  Chart Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-green-400 mr-2" />
                      <span className="text-white">Total Charts</span>
                    </div>
                    <span className="text-green-400 font-bold">{charts.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                    <div className="flex items-center">
                      <Music className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-white">Update Frequency</span>
                    </div>
                    <span className="text-blue-400 font-bold">Real-time</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chart Types */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
                  Chart Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-purple-500/10 rounded-lg">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                    <div>
                      <h4 className="text-white font-medium">Daily Top 20</h4>
                      <p className="text-gray-400 text-sm">24-hour trending songs</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-purple-500/10 rounded-lg">
                    <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                    <div>
                      <h4 className="text-white font-medium">Weekly Top 20</h4>
                      <p className="text-gray-400 text-sm">7-day popular tracks</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-purple-500/10 rounded-lg">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                    <div>
                      <h4 className="text-white font-medium">Monthly Top 20</h4>
                      <p className="text-gray-400 text-sm">30-day popular tracks</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-purple-500/10 rounded-lg">
                    <div className="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
                    <div>
                      <h4 className="text-white font-medium">Yearly Top 20</h4>
                      <p className="text-gray-400 text-sm">365-day popular tracks</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 