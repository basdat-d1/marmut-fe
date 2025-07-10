"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, ArrowLeft } from 'lucide-react';
import { subscriptionAPI } from '@/lib/api';

interface Transaction {
  id: string;
  jenis: string;
  tanggal_dimulai: string;
  tanggal_berakhir: string;
  metode_bayar: string;
  nominal: number;
  nominal_formatted: string;
  status: string;
}

export default function SubscriptionHistoryPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await subscriptionAPI.getTransactionHistory();
        setTransactions(data.transactions || []);
      } catch (error) {
        // handle error if needed
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateString: string) => dateString;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Riwayat Transaksi Paket</CardTitle>
              <Button
                onClick={() => router.push('/subscription')}
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading transaction history...</p>
              </div>
            ) : transactions.length === 0 ? (
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
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Jenis</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Tanggal Dimulai</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Tanggal Berakhir</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Metode Pembayaran</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Nominal</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {transactions.map((transaction, index) => (
                      <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-center">{transaction.jenis}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">{formatDate(transaction.tanggal_dimulai)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">{formatDate(transaction.tanggal_berakhir)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">{transaction.metode_bayar}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">{transaction.nominal_formatted}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${transaction.status === 'Aktif' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{transaction.status}</span>
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
    </div>
  );
} 