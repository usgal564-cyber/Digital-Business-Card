import axios from 'axios'
import type {
  CardData,
  LoginResponse,
  QRDesign,
  QRDesignUpdate,
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
      window.location.href = '/login'
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
