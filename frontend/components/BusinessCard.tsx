'use client'

import {
  FaBuilding,
  FaEnvelope,
  FaFacebook,
  FaGlobe,
  FaMapMarkerAlt,
  FaPhone,
  FaViber,
} from 'react-icons/fa'
import type { QRDesign, User } from '../lib/types'
import QRCode from './QRCode'

interface BusinessCardProps {
  user: User
  qrDesign?: QRDesign | null
  qrValue: string
}

export default function BusinessCard({
  user,
  qrDesign,
  qrValue,
}: BusinessCardProps) {
  return (
    <div className="w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl bg-white">
      <div
        className="relative h-32 bg-gradient-to-br from-primary to-secondary"
        style={
          user.background_image
            ? {
                backgroundImage: `url(${user.background_image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        <div className="absolute -bottom-12 left-6">
          <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-3xl font-bold text-primary overflow-hidden shadow-lg">
            {user.profile_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profile_image}
                alt={user.name || 'Профайл'}
                className="w-full h-full object-cover"
              />
            ) : (
              user.name?.[0]?.toUpperCase() || 'U'
            )}
          </div>
        </div>
      </div>

      <div className="pt-16 px-6 pb-6">
        <h2 className="text-xl font-bold text-dark">
          {user.name || 'Нэргүй хэрэглэгч'}
        </h2>
        {user.title && <p className="text-primary font-medium">{user.title}</p>}
        {user.company && (
          <p className="flex items-center gap-2 text-gray-500 text-sm mt-1">
            <FaBuilding /> {user.company}
          </p>
        )}

        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <p className="flex items-center gap-3">
            <FaPhone className="text-primary" /> {user.phone}
          </p>
          {user.email && (
            <p className="flex items-center gap-3">
              <FaEnvelope className="text-primary" /> {user.email}
            </p>
          )}
          {user.location && (
            <p className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-primary" /> {user.location}
            </p>
          )}
          {user.website && (
            <p className="flex items-center gap-3">
              <FaGlobe className="text-primary" /> {user.website}
            </p>
          )}
          {user.facebook && (
            <p className="flex items-center gap-3">
              <FaFacebook className="text-primary" /> {user.facebook}
            </p>
          )}
          {user.wiber && (
            <p className="flex items-center gap-3">
              <FaViber className="text-primary" /> {user.wiber}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <QRCode value={qrValue} design={qrDesign} />
        </div>
      </div>
    </div>
  )
}
