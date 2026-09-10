'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { QRDesign } from '../lib/types'

type DotStyleKey =
  | 'square'
  | 'dots'
  | 'rounded'
  | 'soft_bubble'
  | 'classy'
  | 'classy_round'
  | 'diamond'
  | 'tiny'

type EyeStyleKey =
  | 'square_square'
  | 'square_dot'
  | 'rounded_rounded'
  | 'rounded_dot'
  | 'rounded_square'
  | 'square_rounded'
  | 'dot_dot'
  | 'dot_square'

export interface ExtendedQRDesign extends Omit<QRDesign, 'qr_logo'> {
  dot_style?: DotStyleKey
  eye_style?: EyeStyleKey
  corner_frame_color?: string
  corner_dot_color?: string
  add_white_frame?: boolean
  frame_color?: string
}

interface QRCodeProps {
  value: string
  design?: ExtendedQRDesign | null
  id?: string
}

export interface QRCodeHandle {
  download: (filename?: string) => void
}

function mapDotType(style?: DotStyleKey) {
  switch (style) {
    case 'dots':
      return 'dots'
    case 'rounded':
      return 'rounded'
    case 'soft_bubble':
      return 'extra-rounded'
    case 'classy':
      return 'classy'
    case 'classy_round':
      return 'classy-rounded'
    case 'diamond':
      return 'classy'
    case 'tiny':
      return 'square'
    case 'square':
    default:
      return 'square'
  }
}

function mapEyeTypes(style?: EyeStyleKey) {
  const map: Record<EyeStyleKey, { square: 'square' | 'dot' | 'extra-rounded'; dot: 'square' | 'dot' }> = {
    square_square: { square: 'square', dot: 'square' },
    square_dot: { square: 'square', dot: 'dot' },
    rounded_rounded: { square: 'extra-rounded', dot: 'dot' },
    rounded_dot: { square: 'extra-rounded', dot: 'dot' },
    rounded_square: { square: 'extra-rounded', dot: 'square' },
    square_rounded: { square: 'square', dot: 'dot' },
    dot_dot: { square: 'dot', dot: 'dot' },
    dot_square: { square: 'dot', dot: 'square' },
  }
  return map[style || 'square_square'] || map.square_square
}

const QRCode = forwardRef<QRCodeHandle, QRCodeProps>(function QRCode({ value, design, id }, ref) {
  const containerRef = useRef<HTMLDivElement>(null)
  const qrRef = useRef<any>(null)

  const size = design?.qr_size || 150
  const fgColor = design?.qr_color || '#0F172A'
  const bgColor = design?.qr_bg_color || '#ffffff'
  const cornerSquareColor = design?.corner_frame_color || fgColor
  const cornerDotColor = design?.corner_dot_color || fgColor
  const withFrame = !!design?.add_white_frame
  const frameColor = design?.frame_color || '#ffffff'
  const eyeTypes = mapEyeTypes(design?.eye_style)

  useEffect(() => {
    let cancelled = false

    async function render() {
      // Сервер дээр ажиллахаас сэргийлнэ
      if (typeof window === 'undefined' || !value || !containerRef.current) return

      try {
        const { default: QRCodeStyling } = await import('qr-code-styling')
        if (cancelled) return

        const instance = new QRCodeStyling({
          width: size,
          height: size,
          data: value,
          margin: 4,
          qrOptions: { errorCorrectionLevel: 'M' },
          dotsOptions: { color: fgColor, type: mapDotType(design?.dot_style) as any },
          backgroundOptions: { color: bgColor },
          cornersSquareOptions: { color: cornerSquareColor, type: eyeTypes.square as any },
          cornersDotOptions: { color: cornerDotColor, type: eyeTypes.dot as any },
        })

        qrRef.current = instance
        if (containerRef.current) {
          containerRef.current.innerHTML = ''
          instance.append(containerRef.current)
          if (id) {
            const el = containerRef.current.querySelector('svg, canvas')
            if (el) el.setAttribute('id', id)
          }
        }
      } catch (err) {
        console.error('Failed to load qr-code-styling:', err)
      }
    }

    render()
    return () => {
      cancelled = true
    }
  }, [
    value,
    size,
    fgColor,
    bgColor,
    cornerSquareColor,
    cornerDotColor,
    design?.dot_style,
    design?.eye_style,
    id,
  ])

  useImperativeHandle(ref, () => ({
    download: (filename = 'qr-code') => {
      qrRef.current?.download({ name: filename, extension: 'png' })
    },
  }))

  return (
    <div
      className="inline-flex items-center justify-center rounded-2xl p-4"
      style={{
        backgroundColor: withFrame ? frameColor : bgColor,
        boxShadow: withFrame ? '0 0 0 1px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      <div ref={containerRef} />
    </div>
  )
})

export default QRCode