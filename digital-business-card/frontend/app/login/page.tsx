'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '../../lib/api'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!phone || phone.length < 8) {
      setError('Утасны дугаараа зөв оруулна уу!')
      return
    }

    setLoading(true)
    try {
      const response = await login(phone)
      if (response.token) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        router.push('/dashboard')
      }
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Нэвтрэхэд алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6C63FF] to-[#FF6584] p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#1a1a2e]">Digital Card</h1>
          <p className="text-gray-500">Утасны дугаараар нэвтрэх</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Жиш: 99119911"
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-full focus:border-[#6C63FF] focus:outline-none"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6C63FF] text-white py-4 rounded-full font-semibold hover:bg-[#6C63FF]/90 disabled:opacity-50"
          >
            {loading ? 'Түр хүлээнэ үү...' : 'Нэвтрэх'}
          </button>
        </form>
      </div>
    </div>
  )
}