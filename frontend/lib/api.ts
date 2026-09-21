import axios from 'axios'
import type {
  CardAnalyticsSummary,
  CardData,
  CardDesign,
  LoginResponse,
  OrderCreate,
  OrderResponse,
  AdminOrderResponse,
  QRDesign,
  QRDesignUpdate,
  TrackEventType,
  User,
  UserUpdate,
} from './types'

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// 401 ирэхэд `window.location.href` ашиглан бүтэн хуудсыг дахин ачаалуулбал
// (hard reload) Next.js-ийн бүх App (Sidebar-г оруулаад) дахин mount хийгдэж,
// дэлгэц бүхэлдээ "анивчсан" мэт харагддаг байсан. Үvнээс зайлсхийхийн тулд
// энд зөвхөн custom event түгээж, AppShell дотор `router.push('/login')`
// ашиглан SPA-navigation хийнэ (дахин ачаалахгvй, тайван шилжинэ).
export const AUTH_LOGOUT_EVENT = 'app:unauthorized'

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== 'undefined' &&
      error.response?.status === 401 &&
      window.location.pathname !== '/login'
    ) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT))
    }
    return Promise.reject(error)
  }
)

export async function login(phone: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/api/auth/login', { phone })
  return res.data
}

export async function getCurrentUser(): Promise<User> {
  const res = await api.get<User>('/api/user/me')
  return res.data
}

export async function updateCurrentUser(update: UserUpdate): Promise<User> {
  const res = await api.put<User>('/api/user/me', update)
  return res.data
}

export async function getCardData(): Promise<CardData> {
  const res = await api.get<CardData>('/api/user/me/card-data')
  return res.data
}

export async function getQRDesign(): Promise<QRDesign> {
  const res = await api.get<QRDesign>('/api/card/qr-design')
  return res.data
}

export async function updateQRDesign(
  update: QRDesignUpdate
): Promise<QRDesign> {
  const res = await api.put<QRDesign>('/api/card/qr-design', update)
  return res.data
}

// Картын харагдах загварыг (Neumorphic / Cyber Y2K / Abstract Art / Glassmorphism)
// сервэрт хадгална — ингэснээр QR-аар өөр хүн орж ирэхэд ижил загвар харагдана.
// Backend талд /api/user/me эсвэл харгалзах endpoint дээр `card_design`
// талбарыг хүлээж авч, User моделдоо хадгалах шаардлагатай.
export async function updateCardDesign(design: CardDesign): Promise<User> {
  const res = await api.put<User>('/api/user/me', { card_design: design })
  return res.data
}

export async function getPublicCard(
  userId: string | number
): Promise<{ user: User; vcf_content: string }> {
  const res = await api.get(`/api/user/${userId}/public`)
  return res.data
}
export async function getVcf(): Promise<{ content: string; filename: string }> {
  const res = await api.get('/api/card/vcf')
  return res.data
}

export async function getTextContent(): Promise<{ content: string }> {
  const res = await api.get('/api/card/text')
  return res.data
}

// --- Статистик (QR уншуулалт / товч дарсан тоо) ---
//
// Backend талд дараах endpoint-vvдийг нэмэх шаардлагатай:
//   POST /api/card/:id/track   { type: 'scan' | 'click', label?, href?, referrer?, user_agent? }
//     - Нэвтрээгvй (нийтэд харагдах /c/[id]) хуудаснаас дуудагдана тул AUTH
//       ШААРДАХГVЙ. Backend талд IP хаягаас улс/хот, User-Agent-аас
//       төхөөрөмж/browser-ийг тодорхойлж хадгална.
//   GET  /api/card/analytics   -> CardAnalyticsSummary
//     - Нэвтэрсэн (эзэмшигч) хэрэглэгчийн өөрийн картын статистикийг буцаана.
//
// Доорх функцууд backend бэлэн болтол UI-г эвдэхгvй байхын тулд алдааг
// дараад нам гvм өнгөрнө (throw хийхгvй) — учир нь tracking нь public
// хуудасны хэвийн ажиллагааг ХЭЗЭЭ Ч тасалдуулах ёсгvй.
export async function trackCardEvent(
  cardId: string | number,
  type: TrackEventType,
  meta?: { label?: string; href?: string; referrer?: string }
): Promise<void> {
  try {
    await api.post(`/api/card/${cardId}/track`, {
      type,
      referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      ...meta,
    })
  } catch {
    // Tracking амжилтгvй болсон ч зочны туршлагад нөлөөлөхгvй — нам гvм өнгөрнө
  }
}

export async function getCardAnalytics(): Promise<CardAnalyticsSummary> {
  const res = await api.get<CardAnalyticsSummary>('/api/card/analytics')
  return res.data
}

// --- Карт захиалга ---

export async function createCardOrder(payload: OrderCreate): Promise<OrderResponse> {
  const res = await api.post<OrderResponse>('/api/card/order', payload)
  return res.data
}

// Зөвхөн admin эрхтэй хэрэглэгчид зориулав — эрхгvй бол backend 403 буцаана.
export async function getAllOrders(): Promise<AdminOrderResponse[]> {
  const res = await api.get<AdminOrderResponse[]>('/api/card/orders')
  return res.data
}

export async function updateOrderStatus(orderId: number, status: string): Promise<OrderResponse> {
  const res = await api.patch<OrderResponse>(`/api/card/order/${orderId}/status`, { status })
  return res.data
}