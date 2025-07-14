"use client"

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'
import { Music, Mic, Heart, Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  const { user } = useAuth()
  const pathname = usePathname()

  if (user || pathname !== '/') {
    return null
  }

  return (
    <footer className="bg-black border-t border-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Music className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">Marmut</span>
            </div>
            <p className="text-gray-300 text-sm">
              Your ultimate music and podcast streaming platform. Discover, create, and share your passion for music.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors cursor-pointer">
                <Heart className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors cursor-pointer">
                <Music className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors cursor-pointer">
                <Mic className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/" className="hover:text-green-500 transition-colors">Premium</Link></li>
              <li><Link href="/" className="hover:text-green-500 transition-colors">Free</Link></li>
              <li><Link href="/" className="hover:text-green-500 transition-colors">Mobile App</Link></li>
              <li><Link href="/" className="hover:text-green-500 transition-colors">Desktop App</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Community</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/" className="hover:text-green-500 transition-colors">For Artists</Link></li>
              <li><Link href="/" className="hover:text-green-500 transition-colors">For Podcasters</Link></li>
              <li><Link href="/" className="hover:text-green-500 transition-colors">For Labels</Link></li>
              <li><Link href="/" className="hover:text-green-500 transition-colors">Developers</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>support@marmut.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+62 21 1234 5678</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400">
            © 2024 Marmut. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
            <Link href="/" className="hover:text-green-500 transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-green-500 transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-green-500 transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 