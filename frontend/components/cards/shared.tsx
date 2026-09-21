import type { ReactNode } from 'react'
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaWhatsapp,
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaMapMarkerAlt,
} from 'react-icons/fa'
import type { User } from '../../lib/types'

export interface CardTemplateProps {
  user: User
  showQr?: boolean
  qrChildren?: ReactNode
  onAddContact?: () => void
  onVcfContact?: () => void
}

export interface SocialItem {
  icon: React.ComponentType<{ className?: string }>
  href: string | null
  label: string
}

export interface RowItem {
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
  href?: string
}

// 4 загвар бүр адилхан датаг өөр өөрийн визуалаар харуулна —
// иймд social/row тооцооллыг нэг газар байлгав.
export function getSocials(user: User): SocialItem[] {
  return [
    { icon: FaFacebookF, href: user.facebook || null, label: 'Facebook' },
    { icon: FaInstagram, href: user.instagram || null, label: 'Instagram' },
    { icon: FaTwitter, href: null, label: 'Twitter / X' },
    { icon: FaWhatsapp, href: user.wiber || null, label: 'WhatsApp' },
  ]
}

// Байршлын утга нь бэлэн URL (жишээ нь Google Maps линк) байвал шууд ашиглаж,
// эсрэгээр энгийн текст хаяг байвал Google Maps хайлтын URL болгож хөрвүүлнэ —
// ингэснээр картан дээрх байршлыг дарахад Maps руу шууд шилждэг болно.
export function getLocationHref(location?: string): string | undefined {
  if (!location) return undefined
  if (/^https?:\/\//i.test(location)) return location
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
}

export function getRows(user: User): RowItem[] {
  return [
    user.phone && { icon: FaPhoneAlt, value: user.phone, label: 'Personal', href: `tel:${user.phone}` },
    user.email && { icon: FaEnvelope, value: user.email, label: 'Personal', href: `mailto:${user.email}` },
    user.website && { icon: FaGlobe, value: user.website, label: 'Work', href: user.website },
    user.location && { icon: FaMapMarkerAlt, value: user.location, label: 'Work', href: getLocationHref(user.location) },
  ].filter(Boolean) as RowItem[]
}

export function initials(name?: string) {
  return name?.[0]?.toUpperCase() || 'U'
}
