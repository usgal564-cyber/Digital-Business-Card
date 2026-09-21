'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import { getCurrentUser, AUTH_LOGOUT_EVENT } from '../lib/api'
import type { User } from '../lib/types'

// Sidebar хэрэггvй хуудаснууд: нэвтрэх хуудас, нийтэд харагдах QR хуудас.
function needsSidebar(pathname: string): boolean {
  if (!pathname || pathname === '/' || pathname === '/login') return false
  if (pathname.startsWith('/c/')) return false
  return true
}

// ЧУХАЛ: Sidebar-г ЭНД, root layout-ийн дотор ЗӨВХӨН НЭГ УДАА зурна.
// Next.js-ийн root layout нь бvх хуудасны хооронд ХЭЗЭЭ Ч unmount хийгддэггvй
// тул Sidebar энд байрлавал хуудас солигдох бvрт дахин vvсэхгvй — өмнөх
// "давхарлаад, refresh хийгээд байгаа юм шиг" мэдрэгдэж байсан асуудал
// vvнээр шийдэгдэнэ. Мөн энэ арга ХУУДАСНЫ ФАЙЛУУДЫГ ЗӨӨХ ШААРДЛАГАГVЙ —
// app/dashboard/page.tsx гэх мэт бvгд яг одоо байгаа газартаа vлдэнэ.
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const show = needsSidebar(pathname || '')

  useEffect(() => {
    if (!show) return
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('token')
    if (!token) return
    getCurrentUser()
      .then(setUser)
      .catch(() => {
        // Хуудас бvр өөрөө токен шалгаж /login руу чиглvvлдэг тул энд
        // алдааг зөвхөн нам гvм vл тоомсорлоно.
      })
  }, [show])

  // api.ts дотор 401 ирэхэд энэ event vvсгэдэг. Sidebar-г unmount хийж,
  // бvтэн хуудсыг дахин ачаалахын оронд router.push ашиглан тайван SPA
  // navigation хийнэ — ингэснээр "анивчих" (flicker) vзэгдэхгvй.
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null)
      router.push('/login')
    }
    window.addEventListener(AUTH_LOGOUT_EVENT, handleUnauthorized)
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleUnauthorized)
  }, [router])

  // Логоут хийхэд Sidebar `localStorage`-г цэвэрлээд router.push('/login')
  // дуудна — гэхдээ `user` state энд арилахгvй байвал шинэ хэрэглэгч
  // нэвтрэхэд (эсвэл буцаад ормогц) хуучин нэрийг агшин зуур харуулж
  // болзошгvй. Тиймээс pathname нь sidebar-гvй хуудас руу шилжвэл user-г
  // цэвэрлэнэ.
  useEffect(() => {
    if (!show) setUser(null)
  }, [show])

  if (!show) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-64 hidden md:block">
        <Sidebar user={user} />
      </div>
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  )
}