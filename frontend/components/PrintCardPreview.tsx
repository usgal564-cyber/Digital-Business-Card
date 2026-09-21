'use client'

import { useEffect, useState } from 'react'
import type { User } from '../lib/types'
import QRCode, { type ExtendedQRDesign } from './QRCode'

export type PrintCardOrientation = 'horizontal' | 'vertical'

export interface PrintCardDesign {
  orientation: PrintCardOrientation
  bg_from: string
  bg_to: string
  accent_color: string
}

export const PRINT_CARD_STORAGE_KEY = 'print_card_design'

export const PRINT_CARD_DEFAULTS: PrintCardDesign = {
  orientation: 'horizontal',
  bg_from: '#0f172a',
  bg_to: '#3f3f9e',
  accent_color: '#38bdf8',
}

// /design хуудсан дээр хэрэглэгч тохируулсан хэвлэмэл картын өнгө/чиглэлийг
// browser-с уншина (backend талбар нэмэгдэхээс өмнө түр зуурын шийдэл).
export function loadPrintCardDesign(): PrintCardDesign {
  if (typeof window === 'undefined') return PRINT_CARD_DEFAULTS
  try {
    const raw = localStorage.getItem(PRINT_CARD_STORAGE_KEY)
    if (!raw) return PRINT_CARD_DEFAULTS
    return { ...PRINT_CARD_DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return PRINT_CARD_DEFAULTS
  }
}

export function savePrintCardDesign(design: PrintCardDesign) {
  if (typeof window === 'undefined') return
  localStorage.setItem(PRINT_CARD_STORAGE_KEY, JSON.stringify(design))
}

interface PrintCardPreviewProps {
  user: User | null
  // Заавал биш: өгвөл эдгээр утгыг ашиглана (жишээ нь /design хуудсан дээр
  // тохируулж байгаа тухайн үеийн утгыг шууд харуулах). Өгөгдөхгvй бол
  // localStorage-с (эсвэл өгөгдмөл утгаас) уншина.
  design?: PrintCardDesign
  onOrientationChange?: (orientation: PrintCardOrientation) => void
  // Хэрэв true бол дотоод localStorage-с УНШИХГVЙ — гадны `design` prop-ыг
  // шууд ашиглана (энэ нь /design хуудсан дээрх LIVE preview-д хэрэгтэй).
  controlled?: boolean
  // Заавал биш: өгвөл картны баруун доод буланд жижиг QR код харуулна
  // (жишээ нь хэрэглэгчийн нийтэд харагдах /c/[id] холбоос).
  qrValue?: string
  qrDesign?: ExtendedQRDesign
}

function initials(name?: string) {
  return name?.[0]?.toUpperCase() || 'U'
}

// Хэвлэмэл (физик) бизнес картны харагдацыг дуурайлган үзүүлэх preview.
// Лого баруун талд, нэр/мэдээлэл зүүн доод буланд байрлана — жинхэнэ
// хэвлэгдсэн картны стандарт зохион байгуулалт.
export default function PrintCardPreview({
  user,
  design,
  onOrientationChange,
  controlled = false,
  qrValue,
  qrDesign,
}: PrintCardPreviewProps) {
  const [localDesign, setLocalDesign] = useState<PrintCardDesign>(PRINT_CARD_DEFAULTS)

  useEffect(() => {
    if (!controlled) {
      setLocalDesign(loadPrintCardDesign())
    }
  }, [controlled])

  if (!user) return null

  const active = controlled ? design || PRINT_CARD_DEFAULTS : localDesign
  const isHorizontal = active.orientation === 'horizontal'

  const setOrientation = (o: PrintCardOrientation) => {
    if (onOrientationChange) {
      onOrientationChange(o)
    } else {
      setLocalDesign((prev) => ({ ...prev, orientation: o }))
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-dark">Хэвлэмэл картын харагдац</h2>
        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
          <button
            type="button"
            onClick={() => setOrientation('horizontal')}
            aria-pressed={isHorizontal}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isHorizontal ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ▭ Хэвтээ
          </button>
          <button
            type="button"
            onClick={() => setOrientation('vertical')}
            aria-pressed={!isHorizontal}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              !isHorizontal ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ▯ Босоо
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center py-2">
        <div
          className="relative rounded-2xl overflow-hidden shadow-[0_18px_40px_-12px_rgba(15,23,42,0.35)] ring-1 ring-black/5"
          style={{
            width: isHorizontal ? 340 : 220,
            aspectRatio: isHorizontal ? '1.68 / 1' : '0.6 / 1',
            background: `linear-gradient(135deg, ${active.bg_from} 0%, #1e293b 45%, ${active.bg_to} 100%)`,
          }}
        >
          {/* Дэвсгэр чимэглэл */}
          <div
            aria-hidden
            className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-30 blur-2xl"
            style={{ background: `radial-gradient(circle, ${active.accent_color}, transparent 70%)` }}
          />
          <div
            aria-hidden
            className="absolute -bottom-12 -right-8 w-44 h-44 rounded-full opacity-25 blur-2xl"
            style={{ background: `radial-gradient(circle, ${active.accent_color}, transparent 70%)` }}
          />

          {/* Дээд зүүн буланд компанийн нэр / тодотгол */}
          {(user.company || user.title) && (
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="text-[9px] font-bold tracking-[0.25em] text-white/60 uppercase truncate">
                {user.company || user.title}
              </span>
            </div>
          )}

          {/* Баруун талд лого / профайл зураг */}
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/95 flex items-center justify-center overflow-hidden shadow-lg ring-2 ring-white/30">
            {user.profile_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.profile_image} alt={user.name || ''} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-extrabold text-slate-700">{initials(user.name)}</span>
            )}
          </div>

          {/* Зүүн доод буланд нэр болон холбоо барих мэдээлэл */}
          <div className={`absolute bottom-4 left-4 ${qrValue ? 'right-[76px]' : 'right-4'}`}>
            <div
              className="h-[2px] w-8 rounded-full mb-2"
              style={{ backgroundColor: active.accent_color }}
            />
            <h3 className="text-white font-bold leading-tight text-base truncate">
              {user.name || 'Нэргүй хэрэглэгч'}
            </h3>
            {user.title && (
              <p className="text-white/70 text-[10px] uppercase tracking-wider truncate mt-0.5">{user.title}</p>
            )}
            <div className="mt-2.5 space-y-0.5">
              {user.phone && <p className="text-white/80 text-[10px] truncate">{user.phone}</p>}
              {user.email && <p className="text-white/80 text-[10px] truncate">{user.email}</p>}
              {user.website && <p className="text-white/60 text-[10px] truncate">{user.website}</p>}
            </div>
          </div>

          {/* Баруун доод буланд жижиг QR код */}
          {qrValue && (
            <div className="absolute bottom-4 right-4 w-14 h-14 rounded-lg overflow-hidden bg-white flex items-center justify-center shadow-lg">
              <QRCode value={qrValue} design={{ ...qrDesign, qr_size: 56 }} compact />
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-gray-400 mt-3 text-center">
        Хэвтээ болон босоо чиглэлээр хэвлэгдэх байдлыг урьдчилан харах
      </p>
    </div>
  )
}
