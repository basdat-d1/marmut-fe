"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { chartAPI } from '@/lib/api'
import { 
  BarChart3, 
  Play, 
  Eye, 
  TrendingUp,
  Music
} from 'lucide-react'

interface Chart {
  tipe: string
  id_playlist: string
}

interface ChartSong {
  judul_lagu: string
  oleh: string
  tanggal_rilis: string
  total_plays: number
  id_song: string
}

export default function ChartPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [charts, setCharts] = useState<Chart[]>([])
  const [selectedChart, setSelectedChart] = useState<Chart | null>(null)
  const [chartSongs, setChartSongs] = useState<ChartSong[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSongs, setLoadingSongs] = useState(false)

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
      setCharts(data.charts || [])
    } catch (error) {
      console.error('Failed to load charts:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChartDetail = async (chart: Chart) => {
    setSelectedChart(chart)
    setLoadingSongs(true)
    try {
      const data = await chartAPI.getChartSongs(chart.tipe)
      setChartSongs(data.songs || [])
    } catch (error) {
      console.error('Failed to load chart detail:', error)
    } finally {
      setLoadingSongs(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Music Charts</h1>
          <p className="text-gray-400">Discover the most popular music</p>
        </div>

        {!selectedChart ? (
          /* Chart List */
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Available Charts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {charts.map((chart) => (
                <Card 
                  key={chart.tipe} 
                  className="bg-gray-900/50 border-gray-800 hover:border-green-500/50 transition-all group"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center text-white group-hover:text-green-400 transition-colors">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      {chart.tipe}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4">
                      Top 20 songs based on play count
                    </p>
                    <Button 
                      className="w-full btn-spotify"
                      onClick={() => loadChartDetail(chart)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Chart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Chart Detail */
          <div>
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => setSelectedChart(null)}
                className="mb-4 border-gray-600 text-white hover:bg-gray-800"
              >
                ← Back to Charts
              </Button>
              <h2 className="text-2xl font-bold text-white">{selectedChart.tipe}</h2>
              <p className="text-gray-400">Top songs based on play count</p>
            </div>

            {loadingSongs ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading chart data...</p>
              </div>
            ) : chartSongs.length > 0 ? (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Song
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Artist
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Release Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Plays
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {chartSongs.map((song, index) => (
                          <tr key={song.id_song} className="hover:bg-gray-800/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={`text-lg font-bold ${
                                  index === 0 ? 'text-yellow-400' : 
                                  index === 1 ? 'text-gray-300' : 
                                  index === 2 ? 'text-amber-500' : 'text-gray-400'
                                }`}>
                                  #{index + 1}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Music className="w-5 h-5 text-gray-400 mr-3" />
                                <div>
                                  <div className="text-sm font-medium text-white">
                                    {song.judul_lagu}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-300">{song.oleh}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-400">
                                {formatDate(song.tanggal_rilis)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <TrendingUp className="w-4 h-4 text-green-400 mr-2" />
                                <span className="text-sm font-medium text-white">
                                  {formatNumber(song.total_plays)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-gray-600 text-white hover:bg-gray-800"
                                  onClick={() => router.push(`/song/${song.id_song}`)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                <Button 
                                  size="sm"
                                  className="btn-spotify"
                                  onClick={() => router.push(`/song/${song.id_song}`)}
                                >
                                  <Play className="w-4 h-4 mr-1" />
                                  Play
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
            ) : (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Chart Data</h3>
                  <p className="text-gray-400">No songs have been played yet for this chart period.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 