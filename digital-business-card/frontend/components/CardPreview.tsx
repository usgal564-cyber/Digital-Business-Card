'use client'

import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaWhatsapp,
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaMapMarkerAlt,
  FaUserPlus,
} from 'react-icons/fa'
import type { User } from '../lib/types'

const BRAND_BLUE = '#3266F0'

interface CardPreviewProps {
  user: Partial<User> | null
  showQr?: boolean
  qrChildren?: React.ReactNode
}

export default function CardPreview({ user, showQr = true, qrChildren }: CardPreviewProps) {
  const initials =
    (user?.name || 'U')
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'

  const socials = [
    { icon: FaFacebookF, href: user?.facebook },
    { icon: FaTwitter, href: null as string | undefined | null },
    { icon: FaInstagram, href: null as string | undefined | null },
    { icon: FaWhatsapp, href: user?.wiber },
  ]

  const rows = [
    user?.phone && { icon: FaPhoneAlt, value: user.phone, label: 'Personal' },
    user?.email && { icon: FaEnvelope, value: user.email, label: 'Personal' },
    user?.website && { icon: FaGlobe, value: user.website, label: 'Work' },
    user?.location && { icon: FaMapMarkerAlt, value: user.location, label: 'Work' },
  ].filter(Boolean) as { icon: React.ComponentType<{ className?: string }>; value: string; label: string }[]

  return (
    <div className="w-full max-w-sm rounded-[28px] overflow-hidden shadow-2xl bg-white">
      {/* Header */}
      <div
        className="text-white text-center pt-8 pb-16 px-4"
        style={{ backgroundColor: BRAND_BLUE }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M12 2 3 12l9 10 9-10-9-10zm0 4.2 5.8 5.8L12 17.8 6.2 12 12 6.2z" />
          </svg>
          <span className="font-bold tracking-wide leading-tight">
            {(user?.company || 'COMPANY').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-center px-6 -mt-12">
        <div
          className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg flex items-center justify-center text-2xl font-bold"
          style={{ color: BRAND_BLUE }}
        >
          {user?.profile_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.profile_image} alt={user?.name || ''} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>

        <h1 className="mt-4 text-xl font-bold text-dark text-center">
          {user?.name || 'Нэргүй хэрэглэгч'}
        </h1>
        {user?.title && (
          <p className="text-gray-400 text-sm text-center mt-0.5">{user.title}</p>
        )}
        {user?.company && (
          <p className="font-semibold text-dark text-sm text-center mt-1">{user.company}</p>
        )}

        <p className="text-gray-400 text-xs mt-4 mb-3">Connect with me on</p>
        <div className="flex gap-3 mb-6">
          {socials.map(({ icon: Icon, href }, i) => (
            <a
              key={i}
              href={href || undefined}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_BLUE)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Icon className="text-sm" />
            </a>
          ))}
        </div>
      </div>

      {/* QR code (toggleable) */}
      {showQr && qrChildren && (
        <div className="flex justify-center px-6 pb-2">
          <div className="border border-gray-100 rounded-2xl p-3">{qrChildren}</div>
        </div>
      )}

      {/* Info rows */}
      <div className="px-6 pb-6 space-y-3 pt-2">
        {rows.map((row, i) => (
          <InfoRow key={i} icon={row.icon} label={row.label} value={row.value} />
        ))}

        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-full font-semibold hover:opacity-90 mt-4"
          style={{ backgroundColor: BRAND_BLUE }}
        >
          <FaUserPlus /> Add to Contacts
        </button>
      </div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3">
      <div
        className="w-9 h-9 rounded-full border flex items-center justify-center shrink-0"
        style={{ borderColor: BRAND_BLUE, color: BRAND_BLUE }}
      >
        <Icon className="text-sm" />
      </div>
      <div>
        <div className="text-sm text-dark font-medium">{value}</div>
        <div className="text-xs text-gray-400">{label}</div>
      </div>
    </div>
  )
}