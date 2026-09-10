'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FaIdCard, FaThLarge, FaQrcode, FaPaintBrush, FaSignOutAlt, FaUser } from 'react-icons/fa'
import toast from 'react-hot-toast'

interface SidebarProps {
  user: any
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { path: '/dashboard', icon: FaThLarge, label: 'Dashboard' },
    { path: '/card', icon: FaQrcode, label: 'Миний Карт' },
    { path: '/design', icon: FaPaintBrush, label: 'QR Design' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Гарлаа')
    router.push('/login')
  }

  return (
    <div className="bg-dark min-h-screen p-6 text-white sticky top-0">
      <div className="flex items-center gap-3 mb-8">
        <FaIdCard className="text-secondary text-2xl" />
        <span className="text-xl font-bold">Digital Card</span>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary/20 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="text-lg" />
              <span>{item.label}</span>
            </Link>
          )
        })}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <FaSignOutAlt className="text-lg" />
          <span>Гарах</span>
        </button>
      </nav>

      <div className="mt-8 p-4 bg-white/5 rounded-xl text-center">
        <div className="w-14 h-14 rounded-full bg-primary mx-auto flex items-center justify-center text-2xl font-bold mb-2">
          {user?.name?.[0] || 'U'}
        </div>
        <div className="font-medium">{user?.name || 'Хэрэглэгч'}</div>
        <div className="text-white/40 text-sm">{user?.phone || '-'}</div>
      </div>
    </div>
  )
}