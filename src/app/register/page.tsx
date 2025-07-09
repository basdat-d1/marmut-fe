"use client"

import { useState } from 'react'
import { useAuth, useToast } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Music, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Mail,
  Lock,
  User,
  MapPin,
  Calendar,
  Phone,
  Users,
  Mic,
  UserCheck
} from 'lucide-react'

export default function RegisterPage() {
  const { register } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const [step, setStep] = useState<'role' | 'form'>('role')
  const [accountType, setAccountType] = useState<'user' | 'label'>('user')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
    nama: '',
    gender: '1',
    tempat_lahir: '',
    tanggal_lahir: '',
    kota_asal: '',
    role: [] as string[]
  })

  const [labelFormData, setLabelFormData] = useState({
    email: '',
    password: '',
    nama: '',
    kontak: ''
  })

  const availableRoles = [
    { id: 'artist', label: 'Artist', icon: Music, description: 'Create and publish music' },
    { id: 'songwriter', label: 'Songwriter', icon: Music, description: 'Write songs for artists' },
    { id: 'podcaster', label: 'Podcaster', icon: Mic, description: 'Create and host podcasts' }
  ]

  const handleRoleToggle = (roleId: string) => {
    setUserFormData(prev => ({
      ...prev,
      role: prev.role.includes(roleId)
        ? prev.role.filter(r => r !== roleId)
        : [...prev.role, roleId]
    }))
  }

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Convert gender to number for backend
      const userData = {
        ...userFormData,
        gender: parseInt(userFormData.gender)
      }
      await register(userData, 'user')
      showToast('Registration successful! Please log in.', 'success')
      router.push('/login?message=registration-success')
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleLabelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await register(labelFormData, 'label')
      showToast('Label registration successful! Please log in.', 'success')
      router.push('/login?message=registration-success')
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <Card className="bg-gray-900/50 border-gray-800 shadow-2xl">
          <CardHeader className="relative space-y-1 text-center pb-8 pl-6">
            {step === 'form' ? (
              <Button 
                variant="ghost" 
                className="absolute left-2 top-6 text-white hover:bg-white/10"
                onClick={() => setStep('role')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <Link href="/">
                <Button variant="ghost" className="absolute left-2 top-6 text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            )}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <Music className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              {step === 'role' ? 'Join Marmut' : `Register as ${accountType === 'user' ? 'User' : 'Label'}`}
            </CardTitle>
            <p className="text-gray-300">
              {step === 'role' 
                ? 'Choose your account type to get started' 
                : 'Fill in your information to create your account'
              }
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error toast will be handled by useToast */}

            {step === 'role' ? (
              <div className="space-y-4">
                {/* User Account Option */}
                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    accountType === 'user' 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setAccountType('user')}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">User Account</h3>
                      <p className="text-gray-300 text-sm mb-3">
                        For music lovers, content creators, and artists. Get access to streaming, 
                        playlists, and premium features.
                      </p>
                      <div className="text-xs text-gray-400">
                        Available roles: Regular User, Artist, Songwriter, Podcaster
                      </div>
                    </div>
                  </div>
                </div>

                {/* Label Account Option */}
                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    accountType === 'label' 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setAccountType('label')}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">Label Account</h3>
                      <p className="text-gray-300 text-sm mb-3">
                        For record labels and music distributors. Manage albums, artists, 
                        and track royalties.
                      </p>
                      <div className="text-xs text-gray-400">
                        Features: Album management, royalty tracking, artist partnerships
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button 
                    onClick={() => setStep('form')}
                    className="btn-spotify px-8 py-2"
                  >
                    Continue with {accountType === 'user' ? 'User' : 'Label'} Account
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {accountType === 'user' ? (
                  <form onSubmit={handleUserSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            value={userFormData.email}
                            onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                            required
                            className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create password"
                            value={userFormData.password}
                            onChange={(e) => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
                            required
                            className="pl-10 pr-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Full Name</label>
                        <div className="relative">
                          <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            type="text"
                            placeholder="Your full name"
                            value={userFormData.nama}
                            onChange={(e) => setUserFormData(prev => ({ ...prev, nama: e.target.value }))}
                            required
                            className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Gender</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <select
                            value={userFormData.gender}
                            onChange={(e) => setUserFormData(prev => ({ ...prev, gender: e.target.value }))}
                            required
                            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-md text-white focus:border-green-500 focus:ring-green-500 focus:outline-none"
                          >
                            <option value="1" className="bg-gray-800">Male</option>
                            <option value="0" className="bg-gray-800">Female</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Birth Place</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            type="text"
                            placeholder="City of birth"
                            value={userFormData.tempat_lahir}
                            onChange={(e) => setUserFormData(prev => ({ ...prev, tempat_lahir: e.target.value }))}
                            required
                            className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Birth Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            type="date"
                            value={userFormData.tanggal_lahir}
                            onChange={(e) => setUserFormData(prev => ({ ...prev, tanggal_lahir: e.target.value }))}
                            required
                            className="pl-10 bg-gray-800/50 border-gray-700 text-white focus:border-green-500 focus:ring-green-500 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:w-0 [&::-webkit-calendar-picker-indicator]:h-0"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-white">Origin City</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            type="text"
                            placeholder="Current city"
                            value={userFormData.kota_asal}
                            onChange={(e) => setUserFormData(prev => ({ ...prev, kota_asal: e.target.value }))}
                            required
                            className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-white">Additional Roles (Optional)</label>
                      <p className="text-xs text-gray-400 mb-3">Select any additional roles that apply to you</p>
                      <div className="space-y-3">
                        {availableRoles.map((role) => {
                          const IconComponent = role.icon
                          return (
                            <label
                              key={role.id}
                              className={`block p-4 rounded-lg border cursor-pointer transition-all ${
                                userFormData.role.includes(role.id)
                                  ? 'border-green-500 bg-green-500/10'
                                  : 'border-gray-700 bg-gray-800/30 hover:bg-gray-800/50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={userFormData.role.includes(role.id)}
                                onChange={() => handleRoleToggle(role.id)}
                                className="sr-only"
                              />
                              <div className="flex items-start">
                                <div className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 flex items-center justify-center ${
                                  userFormData.role.includes(role.id)
                                    ? 'border-green-500 bg-green-500'
                                    : 'border-gray-600'
                                }`}>
                                  {userFormData.role.includes(role.id) && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex items-start">
                                  <IconComponent className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                                  <div>
                                    <div className="text-white font-medium">{role.label}</div>
                                    <div className="text-gray-400 text-sm">{role.description}</div>
                                  </div>
                                </div>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="btn-spotify px-8 py-2"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="loading-spinner mr-2"></div>
                            Creating Account...
                          </div>
                        ) : (
                          'Create User Account'
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleLabelSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Label Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="email"
                          placeholder="label@company.com"
                          value={labelFormData.email}
                          onChange={(e) => setLabelFormData(prev => ({ ...prev, email: e.target.value }))}
                          required
                          className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create password"
                          value={labelFormData.password}
                          onChange={(e) => setLabelFormData(prev => ({ ...prev, password: e.target.value }))}
                          required
                          className="pl-10 pr-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Label Name</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="text"
                          placeholder="Your label name"
                          value={labelFormData.nama}
                          onChange={(e) => setLabelFormData(prev => ({ ...prev, nama: e.target.value }))}
                          required
                          className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Contact Information</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="text"
                          placeholder="Phone number or contact info"
                          value={labelFormData.kontak}
                          onChange={(e) => setLabelFormData(prev => ({ ...prev, kontak: e.target.value }))}
                          required
                          className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="btn-spotify px-8 py-2"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="loading-spinner mr-2"></div>
                            Creating Label...
                          </div>
                        ) : (
                          'Create Label Account'
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </>
            )}

            <div className="text-center">
              <p className="text-gray-300">
                Already have an account?{' '}
                <Link href="/login" className="text-green-400 hover:text-green-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 