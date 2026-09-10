'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FaUserEdit } from 'react-icons/fa'
import Sidebar from '../../components/Sidebar'
import CardPreview from '../../components/CardPreview'
import { getCurrentUser, updateCurrentUser } from '../../lib/api'
import type { User, UserUpdate } from '../../lib/types'

const emptyForm: UserUpdate = {
  name: '',
  title: '',
  company: '',
  age: undefined,
  gender: '',
  email: '',
  phone: '',
  location: '',
  facebook: '',
  wiber: '',
  website: '',
  profile_image: '',
  background_image: '',
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [form, setForm] = useState<UserUpdate>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    getCurrentUser()
      .then((u) => {
        setUser(u)
        setForm({
          name: u.name || '',
          title: u.title || '',
          company: u.company || '',
          age: u.age ?? undefined,
          gender: u.gender || '',
          email: u.email || '',
          location: u.location || '',
          facebook: u.facebook || '',
          wiber: u.wiber || '',
          website: u.website || '',
          profile_image: u.profile_image || '',
          background_image: u.background_image || '',
        })
      })
      .catch(() => {
        toast.error('Мэдээлэл авахад алдаа гарлаа')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
      })
      .finally(() => setLoading(false))
  }, [router])

  const handleChange = (key: keyof UserUpdate, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleFile = (key: 'profile_image' | 'background_image', file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      handleChange(key, reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateCurrentUser(form)
      setUser(updated)
      toast.success('Хадгаллаа')
    } catch {
      toast.error('Хадгалахад алдаа гарлаа')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const inputClass =
    'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-64 hidden md:block">
        <Sidebar user={user} />
      </div>
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="flex items-center gap-3 text-2xl font-bold text-dark mb-6">
            <FaUserEdit className="text-primary" /> Хувийн мэдээлэл
          </h1>

          <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Нэр</label>
                  <input
                    className={inputClass}
                    value={form.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Албан тушаал</label>
                  <input
                    className={inputClass}
                    value={form.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Компани</label>
                  <input
                    className={inputClass}
                    value={form.company || ''}
                    onChange={(e) => handleChange('company', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Нас</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.age ?? ''}
                    onChange={(e) => handleChange('age', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className={labelClass}>Хүйс</label>
                  <select
                    className={inputClass}
                    value={form.gender || ''}
                    onChange={(e) => handleChange('gender', e.target.value)}
                  >
                    <option value="">Сонгох</option>
                    <option value="male">Эрэгтэй</option>
                    <option value="female">Эмэгтэй</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>И-мэйл</label>
                  <input
                    className={inputClass}
                    value={form.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Утас</label>
                  <input
                    className={inputClass}
                    value={user?.phone || ''}
                    disabled
                  />
                </div>
                <div>
                  <label className={labelClass}>Байршил</label>
                  <input
                    className={inputClass}
                    placeholder="Улаанбаатар"
                    value={form.location || ''}
                    onChange={(e) => handleChange('location', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Facebook</label>
                  <input
                    className={inputClass}
                    placeholder="https://facebook.com/..."
                    value={form.facebook || ''}
                    onChange={(e) => handleChange('facebook', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Wiber / WhatsApp</label>
                  <input
                    className={inputClass}
                    placeholder="Wiber хаяг"
                    value={form.wiber || ''}
                    onChange={(e) => handleChange('wiber', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Вебсайт</label>
                  <input
                    className={inputClass}
                    placeholder="https://example.com"
                    value={form.website || ''}
                    onChange={(e) => handleChange('website', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Профайл зураг</label>
                  <label className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl px-4 py-3 text-sm text-primary cursor-pointer hover:bg-gray-50">
                    ⬆ Зураг сонгох
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFile('profile_image', e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
                <div>
                  <label className={labelClass}>Дэвсгэр зураг</label>
                  <label className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl px-4 py-3 text-sm text-primary cursor-pointer hover:bg-gray-50">
                    ⬆ Зураг сонгох
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFile('background_image', e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                  {form.profile_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.profile_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (form.name || 'U')[0]?.toUpperCase()
                  )}
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-6 flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/90 disabled:opacity-50"
              >
                💾 {saving ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>

            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-3">
                👁 Картын харагдац
              </h2>
              <CardPreview user={{ ...user, ...form, phone: user?.phone }} showQr={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
