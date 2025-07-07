"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { subscriptionAPI } from '@/lib/api'
import { 
  Package, 
  Crown, 
  CreditCard, 
  ArrowLeft,
  Check,
  Clock
} from 'lucide-react'

interface Package {
  jenis: string
  harga: number
}

interface Transaction {
  id: string
  jenis_paket: string
  email: string
  timestamp_dimulai: string
  timestamp_berakhir: string
  metode_bayar: string
  nominal: number
}

export default function SubscriptionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    loadData()
  }, [user, router])

  const loadData = async () => {
    try {
      const [packagesData, transactionsData] = await Promise.all([
        subscriptionAPI.getSubscriptions(),
        subscriptionAPI.getTransactionHistory()
      ])
      setPackages(packagesData.packages || [])
      setTransactions(transactionsData.transactions || [])
    } catch (error) {
      console.error('Failed to load subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (pkg: Package) => {
    setSelectedPackage(pkg)
    setShowHistory(false)
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPackage || !paymentMethod) return

    setProcessing(true)
    setError('')

    try {
      await subscriptionAPI.subscribe({
        jenis_paket: selectedPackage.jenis,
        metode_bayar: paymentMethod
      })
      
      // Refresh user data to update premium status
      window.location.reload()
    } catch (error: any) {
      setError(error.message || 'Failed to process subscription')
    } finally {
      setProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading subscription options...</p>
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
              <h1 className="text-3xl font-bold text-white mb-2">Subscription Packages</h1>
              <p className="text-gray-400">Upgrade to Premium for exclusive features</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowHistory(!showHistory)}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              <Clock className="w-4 h-4 mr-2" />
              {showHistory ? 'View Packages' : 'Transaction History'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {user?.is_premium && (
          <Card className="mb-6 bg-gradient-to-r from-yellow-500/20 to-green-500/20 border-yellow-500/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Crown className="w-8 h-8 text-yellow-400 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Premium Active</h3>
                  <p className="text-gray-300">You currently have an active Premium subscription</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {showHistory ? (
          /* Transaction History */
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Transaction History</h2>
            {transactions.length === 0 ? (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Transactions</h3>
                  <p className="text-gray-400">You haven't made any subscription purchases yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <Card key={transaction.id} className="bg-gray-900/50 border-gray-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{transaction.jenis_paket}</h3>
                          <p className="text-sm text-gray-400">
                            {formatDate(transaction.timestamp_dimulai)} - {formatDate(transaction.timestamp_berakhir)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Payment: {transaction.metode_bayar}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            {formatCurrency(transaction.nominal)}
                          </p>
                          <span className="inline-block px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                            Completed
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Subscription Packages */
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {packages.map((pkg) => (
                <Card key={pkg.jenis} className="bg-gray-900/50 border-gray-800 hover:border-green-500/50 transition-all">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-white">{pkg.jenis}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-6">
                      <p className="text-3xl font-bold text-white">{formatCurrency(pkg.harga)}</p>
                      <p className="text-gray-400">per month</p>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center text-gray-300">
                        <Check className="w-4 h-4 text-green-400 mr-2" />
                        Download songs
                      </li>
                      <li className="flex items-center text-gray-300">
                        <Check className="w-4 h-4 text-green-400 mr-2" />
                        No ads
                      </li>
                      <li className="flex items-center text-gray-300">
                        <Check className="w-4 h-4 text-green-400 mr-2" />
                        Unlimited skips
                      </li>
                      <li className="flex items-center text-gray-300">
                        <Check className="w-4 h-4 text-green-400 mr-2" />
                        High quality audio
                      </li>
                    </ul>
                    <Button 
                      onClick={() => handleSubscribe(pkg)}
                      className="w-full btn-spotify"
                      disabled={user?.is_premium}
                    >
                      {user?.is_premium ? 'Already Subscribed' : 'Subscribe'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {selectedPackage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md bg-gray-900/95 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Subscribe to {selectedPackage.jenis}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Total Amount</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(selectedPackage.harga)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Payment Method
                    </label>
                    <select 
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      required
                    >
                      <option value="">Select payment method</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="ewallet">E-Wallet</option>
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      type="submit"
                      disabled={!paymentMethod || processing}
                      className="btn-spotify flex-1"
                    >
                      {processing ? 'Processing...' : 'Subscribe'}
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => setSelectedPackage(null)}
                      variant="outline"
                      className="border-gray-600 text-white hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 