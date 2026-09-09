export interface User {
  id: number
  phone: string
  name?: string | null
  title?: string | null
  company?: string | null
  age?: number | null
  gender?: string | null
  email?: string | null
  location?: string | null
  facebook?: string | null
  wiber?: string | null
  website?: string | null
  profile_image?: string | null
  background_image?: string | null
  created_at: string
  updated_at?: string | null
}

export interface UserUpdate {
  name?: string
  title?: string
  company?: string
  age?: number
  gender?: string
  email?: string
  location?: string
  facebook?: string
  wiber?: string
  website?: string
  profile_image?: string
  background_image?: string
}

export interface QRDesign {
  id: number
  user_id: number
  qr_color: string
  qr_bg_color: string
  qr_size: number
  qr_logo?: string | null
  created_at: string
  updated_at?: string | null
}

export interface QRDesignUpdate {
  qr_color?: string
  qr_bg_color?: string
  qr_size?: number
  qr_logo?: string
}

export interface CardData {
  user: User
  qr_design: QRDesign | null
  vcf_content: string
  text_content: string
}

export interface LoginResponse {
  token: string
  user: User
}
