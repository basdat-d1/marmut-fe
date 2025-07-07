"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Music, 
  Mic, 
  Crown, 
  Star,
  ArrowRight,
  Download,
  BarChart3,
  Heart,
  Globe,
  Shield,
  Smartphone,
  Monitor
} from 'lucide-react'

export default function LandingPage() {
  const { user } = useAuth()
  const router = useRouter()

  const features = [
    {
      icon: Music,
      title: "Millions of Songs",
      description: "Access to a vast library of music from artists around the world",
      gradient: "from-green-400 to-green-600"
    },
    {
      icon: Mic,
      title: "Exclusive Podcasts",
      description: "Discover unique podcasts and audio content from creators",
      gradient: "from-green-400 to-green-600"
    },
    {
      icon: Heart,
      title: "Personalized Playlists",
      description: "Create and share your perfect playlists with smart recommendations",
      gradient: "from-green-400 to-green-600"
    },
    {
      icon: Download,
      title: "Offline Listening",
      description: "Download your favorite songs and listen offline with Premium",
      gradient: "from-green-400 to-green-600"
    },
    {
      icon: BarChart3,
      title: "Music Charts",
      description: "Stay updated with the latest trending music and charts",
      gradient: "from-green-400 to-green-600"
    },
    {
      icon: Crown,
      title: "Premium Features",
      description: "Unlock advanced features with our premium subscription",
      gradient: "from-green-400 to-green-600"
    }
  ]

  const stats = [
    { number: "50M+", label: "Active Users" },
    { number: "100M+", label: "Songs Available" },
    { number: "10K+", label: "Podcasts" },
    { number: "150+", label: "Countries" }
  ]

  const platforms = [
    { icon: Smartphone, name: "Mobile" },
    { icon: Monitor, name: "Desktop" },
    { icon: Globe, name: "Web Player" },
    { icon: Shield, name: "Secure" }
  ]

  if (user) {
    router.push('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl hover-lift">
                  <Music className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-gray-900" />
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 fade-in">
              Music for
              <span className="text-gradient block"> Everyone</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto slide-in-left">
              Discover millions of songs, create playlists, follow artists, and enjoy podcasts. 
              Join the ultimate music streaming experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 slide-in-right">
              <Link href="/register">
                <Button 
                  size="lg" 
                  className="btn-spotify hover-scale"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-green-500 text-green-500 hover:bg-green-500 hover:text-gray-900 px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover-scale"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">{stat.number}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything you need for music
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From streaming to creating, Marmut provides all the tools you need to enjoy and share music.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-900/50 border-gray-800 hover:bg-gray-800/50 transition-all duration-300 hover-lift">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Compatibility */}
      <section className="py-20 bg-black/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Available everywhere
          </h2>
          <p className="text-gray-300 mb-12 max-w-2xl mx-auto">
            Listen to your music on any device, anywhere. Seamless experience across all platforms.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {platforms.map((platform, index) => (
              <div key={index} className="flex flex-col items-center space-y-4 hover-scale">
                <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500/30 rounded-full flex items-center justify-center">
                  <platform.icon className="w-8 h-8 text-green-400" />
                </div>
                <span className="text-white font-medium">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black/50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to start your musical journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join millions of users who are already enjoying Marmut&apos;s amazing features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button 
                size="lg" 
                className="btn-spotify hover-scale"
              >
                Start Listening Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                size="lg" 
                variant="outline"
                className="border-green-500 text-green-500 hover:bg-green-500 hover:text-gray-900 px-8 py-4 text-lg rounded-full hover-scale"
              >
                Already have an account?
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
