"use client"

import { useEffect, useState } from 'react'
import { useAuth, useToast } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { subscriptionAPI } from '@/lib/api'
import { 
  Package, 
  CreditCard, 
  Wallet, 
  History,
  Crown,
  Check,
  ArrowLeft
} from 'lucide-react'

interface Package {
  jenis: string
  harga: number
}

interface Transaction {
  id: string
  jenis: string
  tanggal_dimulai: string
  tanggal_berakhir: string
  metode_bayar: string
  nominal: number
  nominal_formatted: string
  status: string
}

export default function SubscriptionPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    loadData()
  }, [user, router])

  const loadData = async () => {
    try {
      const [packagesData, subscriptionData] = await Promise.all([
        subscriptionAPI.getPackages(),
        subscriptionAPI.getCurrentSubscription()
      ])
      
      setPackages(packagesData.packages || [])
      setCurrentSubscription(subscriptionData.subscription || null)
    } catch (error) {
      showToast('Failed to load subscription data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (pkg: Package) => {
    setSelectedPackage(pkg)
    setShowPaymentForm(true)
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPackage || !paymentMethod) return

    try {
      await subscriptionAPI.subscribe({
        jenis_paket: selectedPackage.jenis,
        metode_bayar: paymentMethod
      })
      
      setShowPaymentForm(false)
      setSelectedPackage(null)
      setPaymentMethod('')
      await loadData() // Refresh data
      
      showToast('Subscription successful!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to subscribe', 'error')
    }
  }

  const handleCancelSubscription = async () => {
    try {
      await subscriptionAPI.cancelSubscription()
      await loadData() // Refresh data
      showToast('Subscription cancelled successfully!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to cancel subscription', 'error')
    }
  }

  const handleCancelConfirm = async () => {
    await handleCancelSubscription()
    setShowCancelConfirm(false)
  }

  const loadTransactionHistory = async () => {
    try {
      const data = await subscriptionAPI.getTransactionHistory()
      setTransactions(data.transactions || [])
      setShowHistory(true)
    } catch (error) {
      showToast('Failed to load transaction history', 'error')
    }
  }

  const formatDate = (dateString: string) => {
    // Handle the formatted date string from API
    return dateString
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading subscription data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Langganan Paket</h1>
          <p className="text-gray-400">Choose your subscription plan</p>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && (
          <Card className="mb-6 bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-500/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Crown className="w-5 h-5 mr-2 text-yellow-400" />
                Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Plan</p>
                  <p className="text-white font-medium">{currentSubscription.jenis}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Valid Until</p>
                  <p className="text-white font-medium">{formatDate(currentSubscription.timestamp_berakhir)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Payment Method</p>
                  <p className="text-white font-medium">{currentSubscription.metode_bayar}</p>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button 
                  onClick={() => setShowCancelConfirm(true)}
                  variant="outline"
                  className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                >
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Packages */}
        <Card className="mb-6 bg-gray-900/50 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center">
                <Package className="w-5 h-5 mr-2 text-green-400" />
                Available Packages
              </CardTitle>
              <Button 
                onClick={loadTransactionHistory}
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                <History className="w-4 h-4 mr-2" />
                Riwayat Transaksi
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map((pkg, index) => (
                <Card 
                  key={pkg.jenis} 
                  className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                    index === 0 ? 'bg-gradient-to-br from-green-900/30 to-green-800/30 border-green-500/50' :
                    index === 1 ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-blue-500/50' :
                    index === 2 ? 'bg-gradient-to-br from-purple-900/30 to-purple-800/30 border-purple-500/50' :
                    'bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 border-yellow-500/50'
                  }`}
                >
                  {index === 0 && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                      POPULAR
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white text-lg">{pkg.jenis}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <div className="text-3xl font-bold text-white mb-2">
                      {formatCurrency(pkg.harga)}
                    </div>
                    <div className="text-gray-300 text-sm mb-4">per month</div>
                    
                    {/* Features */}
                    <div className="space-y-2 mb-6 text-left">
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-gray-300">Ad-free listening</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-gray-300">High quality audio</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-gray-300">Offline downloads</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-gray-300">Unlimited skips</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleSubscribe(pkg)}
                      className={`w-full ${
                        index === 0 ? 'btn-spotify' :
                        index === 1 ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                        index === 2 ? 'bg-purple-600 hover:bg-purple-700 text-white' :
                        'bg-yellow-600 hover:bg-yellow-700 text-white'
                      }`}
                      disabled={!!currentSubscription}
                    >
                      {currentSubscription ? 'Already Subscribed' : 'Subscribe Now'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        {showPaymentForm && selectedPackage && (
          <Card className="mb-6 bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Pembayaran Paket</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-4">Informasi Paket yang Ingin Dibeli:</h3>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Jenis</p>
                      <p className="text-white font-medium">{selectedPackage.jenis}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Harga</p>
                      <p className="text-white font-medium">{formatCurrency(selectedPackage.harga)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Metode Pembayaran
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                    className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:ring-green-500"
                  >
                    <option value="" className="bg-gray-800">Pilih metode pembayaran</option>
                    <option value="transfer bank" className="bg-gray-800">Transfer Bank</option>
                    <option value="kartu kredit" className="bg-gray-800">Kartu Kredit</option>
                    <option value="e-wallet" className="bg-gray-800">E-Wallet</option>
                  </select>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="btn-spotify">
                    Submit
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="border-gray-700 text-white hover:bg-gray-800"
                    onClick={() => {
                      setShowPaymentForm(false)
                      setSelectedPackage(null)
                      setPaymentMethod('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Transaction History */}
        {showHistory && (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Riwayat Transaksi Paket</CardTitle>
                <Button 
                  onClick={() => setShowHistory(false)}
                  variant="outline"
                  className="border-gray-700 text-white hover:bg-gray-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Transaction History</h3>
                  <p className="text-gray-400">You haven't made any transactions yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Jenis
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Tanggal Dimulai
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Tanggal Berakhir
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Metode Pembayaran
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Nominal
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {transactions.map((transaction, index) => (
                        <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-center">
                            {transaction.jenis}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                            {formatDate(transaction.tanggal_dimulai)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                            {formatDate(transaction.tanggal_berakhir)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                            {transaction.metode_bayar}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                            {transaction.nominal_formatted}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              transaction.status === 'Aktif' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {transaction.status}
                            </span>
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

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showCancelConfirm}
          onClose={() => setShowCancelConfirm(false)}
          onConfirm={handleCancelConfirm}
          title="Cancel Subscription"
          message="Are you sure you want to cancel your subscription? This action cannot be undone."
          type="delete"
          confirmText="Cancel Subscription"
        />
      </div>
    </div>
  )
} 