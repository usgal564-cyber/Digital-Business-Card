'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FaShieldAlt, FaSyncAlt, FaQrcode, FaIdCard, FaCopy, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa'
import CardPreview from '../../components/CardPreview'
import QRCode from '../../components/QRCode'
import { getCurrentUser, getAllOrders, updateOrderStatus } from '../../lib/api'
import type { AdminOrderResponse, User } from '../../lib/types'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Хvлээгдэж буй', icon: FaClock },
  { value: 'done', label: 'Хийсэн', icon: FaCheckCircle },
  { value: 'cancelled', label: 'Хийгээгvй', icon: FaTimesCircle },
] as const

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('mn-MN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function statusColor(status: string) {
  switch (status) {
    case 'done':
      return 'bg-emerald-50 text-emerald-600'
    case 'cancelled':
      return 'bg-red-50 text-red-500'
    default:
      return 'bg-amber-50 text-amber-600'
  }
}

function orderTypeLabel(order: AdminOrderResponse) {
  if (order.order_type === 'qr') {
    return order.qr_subtype === 'physical' ? 'QR · Биетээр' : 'QR · Утсан дээр'
  }
  return order.card_orientation === 'vertical' ? 'Карт · Босоо' : 'Карт · Хэвтээ'
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<AdminOrderResponse[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const router = useRouter()

  const load = async () => {
    try {
      const u = await getCurrentUser()
      setUser(u)
      if (!u.is_admin) {
        setForbidden(true)
        setLoading(false)
        setRefreshing(false)
        return
      }
      const o = await getAllOrders()
      setOrders(o)
      setForbidden(false)
    } catch {
      setForbidden(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.push('/login')
      return
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const handleRefresh = () => {
    setRefreshing(true)
    load()
  }

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      await updateOrderStatus(orderId, status)
      setOrders((prev) =>
        prev ? prev.map((o) => (o.id === orderId ? { ...o, status } : o)) : prev
      )
      toast.success('Статус шинэчлэгдлээ')
    } catch {
      toast.error('Шинэчлэхэд алдаа гарлаа')
    }
  }

  const handleCopyLink = async (userId: string | number) => {
    const url = `${window.location.origin}/c/${userId}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Холбоос хуулагдлаа')
    } catch {
      toast.error('Хуулахад алдаа гарлаа')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (forbidden) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center max-w-sm">
          <FaShieldAlt className="text-3xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Энэ хуудсанд хандах эрхгvй байна.</p>
        </div>
      </div>
    )
  }

  const list = orders || []

  return (
    <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="flex items-center gap-3 text-2xl font-bold text-dark">
              <FaShieldAlt className="text-primary" /> Admin — Захиалгууд
            </h1>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors disabled:opacity-50"
            >
              <FaSyncAlt className={refreshing ? 'animate-spin' : ''} /> Шинэчлэх
            </button>
          </div>

          {list.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-gray-400 text-sm">
              Одоогоор ирсэн захиалга алга
            </div>
          ) : (
            <div className="space-y-5">
              {list.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="font-semibold text-dark">
                        {order.user.name || 'Нэргvй'} · {order.user.phone}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {orderTypeLabel(order)} · {order.price.toLocaleString()}₮
                        {order.contact_phone ? ` · Холбогдох утас: ${order.contact_phone}` : ''}
                      </p>
                      {order.address && (
                        <p className="text-xs text-gray-400 mt-0.5">Хаяг: {order.address}</p>
                      )}
                      {order.note && (
                        <p className="text-xs text-gray-400 italic mt-0.5">{order.note}</p>
                      )}
                      <p className="text-[11px] text-gray-300 mt-1">{formatDate(order.created_at)}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusColor(order.status)}`}>
                        {STATUS_OPTIONS.find((s) => s.value === order.status)?.label || order.status}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {STATUS_OPTIONS.map((s) => {
                          const Icon = s.icon
                          const active = order.status === s.value
                          return (
                            <button
                              key={s.value}
                              type="button"
                              onClick={() => handleStatusChange(order.id, s.value)}
                              title={s.label}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                                active
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
                              }`}
                            >
                              <Icon className="text-xs" />
                              {s.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Захиалагчийн БОДИТ карт болон QR — /card дээрх адилхан харагдана */}
                  <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start border-t border-gray-100 pt-4">
                    <div className="max-w-[340px]">
                      <CardPreview
                        user={order.user}
                        showQr={false}
                        design={order.user.card_design}
                      />
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
                        <QRCode
                          value={`${typeof window !== 'undefined' ? window.location.origin : ''}/c/${order.user.id}`}
                          design={order.qr_design}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(order.user.id)}
                        className="flex items-center gap-2 text-xs font-medium text-primary hover:underline"
                      >
                        <FaCopy /> QR холбоос хуулах
                      </button>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        {order.order_type === 'physical' ? <FaIdCard /> : <FaQrcode />}
                        /c/{order.user.id}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
    </div>
  )
}
