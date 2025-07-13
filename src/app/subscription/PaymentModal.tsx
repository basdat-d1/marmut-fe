import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Package {
  jenis: string;
  harga: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: Package | null;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  selectedPackage,
  paymentMethod,
  setPaymentMethod,
  onSubmit,
}) => {
  if (!isOpen || !selectedPackage) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <span className="text-xl">×</span>
        </button>
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
          <form onSubmit={onSubmit} className="space-y-4">
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
                <option value="Transfer Bank" className="bg-gray-800">Transfer Bank</option>
                <option value="Kartu Kredit" className="bg-gray-800">Kartu Kredit</option>
                <option value="E-Wallet" className="bg-gray-800">E-Wallet</option>
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
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </div>
    </div>
  );
};

export default PaymentModal; 