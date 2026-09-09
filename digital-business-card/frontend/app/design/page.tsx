'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  FaPaintBrush,
  FaEye,
  FaUndo,
  FaDownload,
  FaInfoCircle,
  FaCheck,
  FaUpload,
} from 'react-icons/fa'
import Sidebar from '../../components/Sidebar'
import QRCode from '../../components/QRCode'
import { getCurrentUser, getQRDesign, updateQRDesign } from '../../lib/api'
import type { QRDesign, User } from '../../lib/types'

/**
 * NOTE FOR BACKEND / lib/types.ts:
 * The fields below (dot_style, eye_style, corner_frame_color, corner_dot_color,
 * add_white_frame, logo_size) do not exist yet on QRDesign. They are typed here
 * as an extension so the page compiles; add them to QRDesign in lib/types.ts and
 * to the API payload in updateQRDesign once the backend supports them. Until then
 * they are saved to local state only and are NOT sent to updateQRDesign.
 */
type DotStyleKey = 'square' | 'dots' | 'rounded' | 'soft_bubble' | 'classy' | 'classy_round' | 'diamond' | 'tiny'
type EyeStyleKey =
  | 'square_square'
  | 'square_dot'
  | 'rounded_rounded'
  | 'rounded_dot'
  | 'rounded_square'
  | 'square_rounded'
  | 'dot_dot'
  | 'dot_square'

interface ExtendedQRDesign extends QRDesign {
  dot_style?: DotStyleKey
  eye_style?: EyeStyleKey
  corner_frame_color?: string
  corner_dot_color?: string
  add_white_frame?: boolean
  logo_size?: number
}

const DEFAULTS: Partial<ExtendedQRDesign> = {
  qr_color: '#0F172A',
  qr_bg_color: '#ffffff',
  qr_size: 150,
  dot_style: 'square',
  eye_style: 'square_square',
  corner_frame_color: '#0F172A',
  corner_dot_color: '#0F172A',
  add_white_frame: false,
  logo_size: 30,
}

const DOT_STYLES: { key: DotStyleKey; label: string }[] = [
  { key: 'square', label: 'Square' },
  { key: 'dots', label: 'Dots' },
  { key: 'rounded', label: 'Rounded' },
  { key: 'soft_bubble', label: 'Soft Bubble' },
  { key: 'classy', label: 'Classy' },
  { key: 'classy_round', label: 'Classy Round' },
  { key: 'diamond', label: 'Diamond' },
  { key: 'tiny', label: 'Tiny' },
]

const EYE_STYLES: { key: EyeStyleKey; label: string }[] = [
  { key: 'square_square', label: 'Square / Square' },
  { key: 'square_dot', label: 'Square / Dot' },
  { key: 'rounded_rounded', label: 'Rounded / Rounded' },
  { key: 'rounded_dot', label: 'Rounded / Dot' },
  { key: 'rounded_square', label: 'Rounded / Square' },
  { key: 'square_rounded', label: 'Square / Rounded' },
  { key: 'dot_dot', label: 'Dot / Dot' },
  { key: 'dot_square', label: 'Dot / Square' },
]

const PRESET_COLORS = [
  '#000000',
  '#2563EB',
  '#1E1B4B',
  '#7C3AED',
  '#DC2626',
  '#059669',
  '#D97706',
  '#1D4ED8',
  '#BE185D',
  '#0891B2',
]

export default function DesignPage() {
  const [user, setUser] = useState<User | null>(null)
  const [design, setDesign] = useState<ExtendedQRDesign | null>(null)
  const [logoName, setLogoName] = useState('Лого сонгоогүй')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.push('/login')
      return
    }

    Promise.all([getCurrentUser(), getQRDesign()])
      .then(([u, d]) => {
        setUser(u)
        setDesign({ ...DEFAULTS, ...d })
        if (d.qr_logo) setLogoName('Лого сонгосон')
      })
      .catch(() => toast.error('Мэдээлэл авахад алдаа гарлаа'))
      .finally(() => setLoading(false))
  }, [router])

  const handleChange = <K extends keyof ExtendedQRDesign>(key: K, value: ExtendedQRDesign[K]) => {
    setDesign((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const handleLogo = (file: File | null) => {
    if (!file) return
    setLogoName(file.name)
    const reader = new FileReader()
    reader.onload = () => handleChange('qr_logo', reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!design) return
    setSaving(true)
    try {
      // Only fields the backend currently supports are sent.
      // dot_style / eye_style / corner_frame_color / corner_dot_color /
      // add_white_frame / logo_size are UI-only until the backend adds them.
      const updated = await updateQRDesign({
        qr_color: design.qr_color,
        qr_bg_color: design.qr_bg_color,
        qr_size: design.qr_size,
        qr_logo: design.qr_logo || undefined,
      })
      setDesign((prev) => (prev ? { ...prev, ...updated } : updated))
      toast.success('Хадгаллаа')
    } catch {
      toast.error('Хадгалахад алдаа гарлаа')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setDesign((prev) => (prev ? { ...prev, ...DEFAULTS, qr_logo: null } : prev))
    setLogoName('Лого сонгоогүй')
  }

  const handleDownload = () => {
    const svg = document.getElementById('design-qr-svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'qr-code.svg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const shareUrl =
    typeof window !== 'undefined' && user
      ? `${window.location.origin}/c/${user.id}`
      : ''

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const value = shareUrl || user?.phone || ''
  const eyeLabel =
    EYE_STYLES.find((e) => e.key === design?.eye_style)?.label || 'Square / Square'

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-64 hidden md:block">
        <Sidebar user={user} />
      </div>
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="flex items-center gap-3 text-2xl font-bold text-dark mb-1">
            <FaPaintBrush className="text-primary" /> QR Дизайн тохиргоо
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            QR кодын хэлбэр, өнгө, дэвсгэр, хүрээ, лого зэргийг тохируулах
          </p>

          <div className="grid lg:grid-cols-[1fr_400px] gap-6 items-start">
            {/* LEFT: settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-8">
              {/* Dot style */}
              <section>
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <h2 className="font-semibold text-dark text-sm">Dot Style</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    QR кодын дотоод жижиг цэгүүдийн хэлбэрийг тохируулна
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {DOT_STYLES.map((s) => (
                    <StyleCard
                      key={s.key}
                      label={s.label}
                      selected={design?.dot_style === s.key}
                      onClick={() => handleChange('dot_style', s.key)}
                    />
                  ))}
                </div>
              </section>

              {/* Eye style */}
              <section>
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <h2 className="font-semibold text-dark text-sm">Eye Style</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    3 булангийн том дөрвөлжин болон дотоод цэгийг тохируулна
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {EYE_STYLES.map((s) => (
                    <StyleCard
                      key={s.key}
                      label={s.label}
                      selected={design?.eye_style === s.key}
                      onClick={() => handleChange('eye_style', s.key)}
                    />
                  ))}
                </div>
              </section>

              {/* Colors */}
              <section>
                <h2 className="font-semibold text-dark text-sm mb-4">Өнгөний тохиргоо</h2>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <ColorField
                    label="QR цэгүүд"
                    value={design?.qr_color || DEFAULTS.qr_color!}
                    onChange={(v) => handleChange('qr_color', v)}
                  />
                  <ColorField
                    label="Булангийн хүрээ"
                    value={design?.corner_frame_color || DEFAULTS.corner_frame_color!}
                    onChange={(v) => handleChange('corner_frame_color', v)}
                  />
                  <ColorField
                    label="Булангийн цэг"
                    value={design?.corner_dot_color || DEFAULTS.corner_dot_color!}
                    onChange={(v) => handleChange('corner_dot_color', v)}
                  />
                </div>
                <ColorField
                  label="Дэвсгэр өнгө"
                  value={design?.qr_bg_color || DEFAULTS.qr_bg_color!}
                  onChange={(v) => handleChange('qr_bg_color', v)}
                />

                <p className="text-xs font-medium text-gray-500 mt-5 mb-2 tracking-wide uppercase">
                  Бэлэн загварууд
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleChange('qr_color', c)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        design?.qr_color === c ? 'border-primary' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={c}
                    />
                  ))}
                </div>
              </section>

              {/* QR size */}
              <section>
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">QR хэмжээ (px)</label>
                  <input
                    type="range"
                    min={100}
                    max={300}
                    value={design?.qr_size || DEFAULTS.qr_size}
                    onChange={(e) => handleChange('qr_size', Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>100px</span>
                    <span className="font-medium text-gray-600">
                      {design?.qr_size || DEFAULTS.qr_size}px
                    </span>
                    <span>300px</span>
                  </div>
                </div>
              </section>

              {/* Frame & logo */}
              <section>
                <h2 className="font-semibold text-dark text-sm mb-4">Хүрээ ба Лого</h2>

                <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Цагаан хүрээ нэмэх</p>
                    <p className="text-xs text-gray-400">QR кодын эргэн тойронд цэвэрхэн хүрээ</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange('add_white_frame', !design?.add_white_frame)}
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                      design?.add_white_frame ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                        design?.add_white_frame ? 'left-6' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR лого (төвд зураг)
                </label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl px-4 py-8 text-sm text-primary cursor-pointer hover:bg-gray-100">
                  <FaUpload />
                  Лого сонгох
                  <span className="text-xs text-gray-400 font-normal">PNG, JPG, SVG 2MB хүртэл</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleLogo(e.target.files?.[0] || null)}
                  />
                </label>
                <p className="text-xs text-gray-400 mt-2">{logoName}</p>

                {design?.qr_logo && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
                      <span>Лого хэмжээ</span>
                      <span className="font-medium">{design?.logo_size ?? DEFAULTS.logo_size}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={50}
                      value={design?.logo_size ?? DEFAULTS.logo_size}
                      onChange={(e) => handleChange('logo_size', Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                )}
              </section>

              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-full font-semibold hover:bg-primary/90"
              >
                <FaUndo /> Анхны төлөв рүү буцаах
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-dark text-white py-3 rounded-full font-semibold hover:bg-dark/90 disabled:opacity-50"
              >
                {saving ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>

            {/* RIGHT: live preview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm lg:sticky lg:top-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="flex items-center gap-2 font-semibold text-dark">
                  <FaEye /> Preview
                </h2>
                <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> LIVE
                </span>
              </div>

              <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl py-10 border border-dashed border-gray-200">
                {value ? (
                  <QRCode id="design-qr-svg" value={value} design={design} />
                ) : (
                  <p className="text-gray-400 text-sm">QR код үүсгэхэд алдаа гарлаа</p>
                )}
              </div>

              <div className="mt-5 divide-y divide-gray-100 text-sm">
                <PreviewRow label="Нэр" value={user?.name || '-'} />
                <PreviewRow
                  label="Хэлбэр"
                  value={`${
                    DOT_STYLES.find((d) => d.key === design?.dot_style)?.label || 'Square'
                  } / ${eyeLabel}`}
                />
                <PreviewRow
                  label="Цэгийн өнгө"
                  value={design?.qr_color || DEFAULTS.qr_color!}
                  swatch={design?.qr_color || DEFAULTS.qr_color!}
                />
                <PreviewRow label="Хүрээ" value={design?.add_white_frame ? 'Идэвхтэй' : 'None'} />
                <PreviewRow
                  label="Лого"
                  value={
                    design?.qr_logo ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <FaCheck className="text-xs" /> Байршуулсан
                      </span>
                    ) : (
                      'None'
                    )
                  }
                />
              </div>

              <button
                onClick={handleDownload}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-secondary to-pink-400 text-white px-5 py-3 rounded-full font-medium hover:opacity-90"
              >
                <FaDownload /> QR татаж авах
              </button>

              <div className="mt-4 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                <FaInfoCircle className="mt-0.5 shrink-0" />
                Хадгалахад QR зураг дахин үүснэ. Уншуулах URL нь өөрчлөгдөхгүй.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StyleCard({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-colors ${
        selected
          ? 'border-primary text-primary bg-primary/5'
          : 'border-gray-200 text-gray-500 hover:border-gray-300'
      }`}
    >
      {selected && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center">
          <FaCheck className="text-[9px]" />
        </span>
      )}
      <span className="grid grid-cols-3 gap-0.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 ${selected ? 'bg-primary' : 'bg-gray-300'} ${
              label.toLowerCase().includes('dot') || label.toLowerCase().includes('bubble')
                ? 'rounded-full'
                : label.toLowerCase().includes('round')
                ? 'rounded-sm'
                : ''
            }`}
          />
        ))}
      </span>
      {label}
    </button>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <label className="block text-xs font-medium text-gray-500 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 shrink-0"
        />
        <span className="text-xs text-gray-500 font-mono truncate">{value}</span>
      </div>
    </div>
  )
}

function PreviewRow({
  label,
  value,
  swatch,
}: {
  label: string
  value: React.ReactNode
  swatch?: string
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-gray-400">{label}</span>
      <span className="flex items-center gap-2 font-medium text-dark">
        {swatch && (
          <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: swatch }} />
        )}
        {value}
      </span>
    </div>
  )
}