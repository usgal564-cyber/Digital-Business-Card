'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '../../lib/api'
import { Phone, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const trimmed = phone.trim()
    const isAdminCode = trimmed === '4567'

    if (!trimmed || (!isAdminCode && trimmed.length < 8)) {
      setError('Утасны дугаараа зөв оруулна уу!')
      return
    }

    setLoading(true)
    try {
      const response = await login(phone)
      if (response.token) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        
        if (phone.trim() === '4567') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Нэвтрэхэд алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0d0f17] overflow-hidden p-4">
      {/* Background Glow Blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#6C63FF]/30 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#FF6584]/25 rounded-full blur-[128px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl transition-all duration-300 hover:border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#FF6584] mb-4 shadow-lg shadow-[#6C63FF]/20">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Punch<span className="text-[#FF6584]">.mn</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Платформд нэвтрэхийн тулд утасны дугаараа оруулна уу
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">
              Утасны дугаар
            </label>
            <div className="relative flex items-center">
              <Phone className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="99119911"
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/30 transition-all text-base tracking-wide disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-[#6C63FF] to-[#FF6584] text-white py-4 rounded-2xl font-semibold shadow-lg shadow-[#6C63FF]/25 hover:shadow-xl hover:shadow-[#6C63FF]/40 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Нэвтэрч байна...</span>
              </>
            ) : (
              <>
                <span>Нэвтрэх</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Системд нэвтрэхэд асуудал гарвал тусламжийн хэсэгт хандана уу.
          </p>
        </div>
      </div>
    </div>
  )
}