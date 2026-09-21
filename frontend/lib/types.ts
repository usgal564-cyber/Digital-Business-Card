export type DotStyleKey =
  | 'square'
  | 'dots'
  | 'rounded'
  | 'soft_bubble'
  | 'classy'
  | 'classy_round'
  | 'diamond'
  | 'tiny'

export type EyeStyleKey =
  | 'square_square'
  | 'square_dot'
  | 'rounded_rounded'
  | 'rounded_dot'
  | 'rounded_square'
  | 'square_rounded'
  | 'dot_dot'
  | 'dot_square'

export interface QRDesign {
  dot_style?: DotStyleKey
  eye_style?: EyeStyleKey
  // Доорх талбарууд нь QRCode.tsx болон /design хуудсанд бодитоор ашиглагддаг
  // нэрүүд — өмнө нь энд `color`/`bg_color` гэж өөр нэрээр тодорхойлогдсон
  // байснаас болж /design дээр хийсэн тохиргоо (QR-ийн хэлбэр, булангийн
  // өнгө, хүрээ) "Миний Карт" дээр бүрэн дамждаггvй асуудал үvсэж байсан.
  qr_color?: string
  qr_bg_color?: string
  qr_size?: number
  corner_frame_color?: string
  corner_dot_color?: string
  add_white_frame?: boolean
  frame_color?: string
  // QR кодын голд харагдах лого (base64 өгөгдөл эсвэл URL)
  qr_logo?: string
  // Хуучин код бусад газар ашигладаг байж болзошгvй тул хадгалав
  color?: string
  bg_color?: string
  logo_url?: string
}

// Картын харагдах загвар — /card дээр сонгоод сервэрт хадгалж,
// /c/[id] дээр зочдод харагдана.
export type CardDesign = 'neumorphic' | 'cyber' | 'abstract' | 'glass'

export const CARD_DESIGNS: { id: CardDesign; label: string }[] = [
  { id: 'neumorphic', label: 'Neumorphic' },
  { id: 'cyber', label: 'Cyber Y2K' },
  { id: 'abstract', label: 'Abstract Art' },
  { id: 'glass', label: 'Glassmorphism' },
]

export interface User {
  id: string
  name: string
  title?: string
  company?: string
  email?: string
  phone?: string
  bio?: string
  avatar_url?: string
  social_links?: Record<string, string>
  qr_design?: QRDesign
  card_design?: CardDesign
  is_admin?: boolean
  [key: string]: any // Бусад нэмэлт талбаруудад алдаа заахаас сэргийлнэ
}

// /analytics хуудсанд ашиглагдана — backend "хэн хааноос орж ирсэн, ямар товч
// дарсан" гэдгийг бvртгэж, нэгтгэсэн тайланг эндхийн бvтцээр буцаах ёстой.
export interface CardScanEvent {
  id: string
  created_at: string
  // Backend IP хаягаас тодорхойлсон улс/хот (боломжтой бол)
  location?: string
  // User-Agent-аас задалсан төхөөрөмж/browser мэдээлэл (жишээ нь "iPhone · Safari")
  device?: string
  browser?: string
  // Хаанаас (ямар холбоос/суваг) орж ирснийг заана — жишээ нь Instagram,
  // Facebook, шууд холбоос, эсвэл QR камер уншуулалт
  referrer?: string
  source?: string
}

export interface CardClickEvent {
  id: string
  created_at: string
  // Ямар товч/холбоос дээр дарснийг заана — жишээ нь "Facebook", "Утас",
  // "Add Contact", "Вебсайт" гэх мэт
  label: string
  href?: string
  location?: string
  device?: string
}

export interface CardAnalyticsSummary {
  total_scans: number
  unique_visitors: number
  total_clicks: number
  // Товч тус бvрээр хэдэн удаа дарагдсаныг нэгтгэсэн тоо
  clicks_by_label: { label: string; count: number }[]
  recent_scans: CardScanEvent[]
  recent_clicks: CardClickEvent[]
}

export type TrackEventType = 'scan' | 'click'

// --- Карт захиалга ---

export type CardOrderType = 'qr' | 'card'
export type QRSubtype = 'phone' | 'physical'
export type CardOrientation = 'vertical' | 'horizontal'

// Backend талд ТООЦООЛОГДОНО — frontend зөвхөн харуулахад ашиглана
export const ORDER_PRICES: Record<string, number> = {
  'qr:phone': 50000,
  'qr:physical': 70000,
  'card:vertical': 80000,
  'card:horizontal': 80000,
}

export interface OrderCreate {
  order_type: CardOrderType
  qr_subtype?: QRSubtype
  card_orientation?: CardOrientation
  contact_phone?: string
  quantity?: number
  address?: string
  note?: string
}

export interface OrderResponse {
  id: number
  order_type: CardOrderType
  qr_subtype?: QRSubtype
  card_orientation?: CardOrientation
  price: number
  contact_phone?: string
  quantity: number
  address?: string
  note?: string
  status: string
  created_at: string
}

export interface AdminOrderResponse extends OrderResponse {
  user: User
  qr_design?: QRDesign
}

export interface LoginResponse {
  token: string
  user: User
}

// Хэрэглэгчийн мэдээллийг хэсэгчлэн шинэчлэхэд ашиглана (PUT /api/user/me)
export type UserUpdate = Partial<User>

// QR дизайныг хэсэгчлэн шинэчлэхэд ашиглана (PUT /api/card/qr-design)
export type QRDesignUpdate = Partial<QRDesign>

// /card хуудсанд ашиглагддаг нэгтгэсэн дата бүтэц
export interface CardData {
  user: User
  text_content?: string
  qr_design?: QRDesign
}
