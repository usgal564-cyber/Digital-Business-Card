// Add/merge this into lib/types.ts

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
  qr_color?: string
  qr_bg_color?: string
  qr_size?: number
  qr_logo?: string | null
  // New fields — must also exist on the backend model/serializer
  dot_style?: DotStyleKey
  eye_style?: EyeStyleKey
  corner_frame_color?: string
  corner_dot_color?: string
  add_white_frame?: boolean
  logo_size?: number
}