'use client'

import QRCodeSvg from 'react-qr-code'
import type { QRDesign } from '../lib/types'

interface QRCodeProps {
  value: string
  design?: QRDesign | null
  id?: string
}

export default function QRCode({ value, design, id }: QRCodeProps) {
  const size = design?.qr_size || 150
  const fgColor = design?.qr_color || '#1a1a2e'
  const bgColor = design?.qr_bg_color || '#ffffff'

  return (
    <div
      className="inline-flex items-center justify-center rounded-2xl p-4"
      style={{ backgroundColor: bgColor }}
    >
      <QRCodeSvg
        id={id}
        value={value}
        size={size}
        fgColor={fgColor}
        bgColor={bgColor}
      />
    </div>
  )
}
