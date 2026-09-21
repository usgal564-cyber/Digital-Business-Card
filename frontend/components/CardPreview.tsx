'use client'

import type { ReactNode } from 'react'
import toast from 'react-hot-toast'
import type { User } from '../lib/types'
import { CARD_DESIGNS, type CardDesign } from '../lib/types'
import { getVcf } from '../lib/api'
import NeumorphicCard from './cards/NeumorphicCard'
import CyberCard from './cards/CyberCard'
import AbstractCard from './cards/AbstractCard'
import GlassCard from './cards/GlassCard'

// Хуучин код `../components/CardPreview`-с CardDesign/CARD_DESIGNS импортолсоор байгаа
// тул энд дахин export хийж уялдаа алдагдахаас сэргийлнэ.
export type { CardDesign }
export { CARD_DESIGNS }

interface CardPreviewProps {
  user: User | null
  showQr?: boolean
  qrChildren?: ReactNode
  design?: CardDesign
  // Заавал биш: эдгээрийг өгвөл CardPreview дотоод getVcf()-г (зөвхөн нэвтэрсэн
  // хэрэглэгчид зориулагдсан) ашиглахгvй, харин өгсөн handler-уудыг ашиглана.
  // /c/[id] (нийтэд харагдах хуудас) дээр ЗААВАЛ дамжуулна — тэнд өөр хэн нэгний
  // vcf өгөгдлийг аль хэдийн серверээс татчихсан байдаг тул getVcf() дуудах
  // шаардлагагvй бөгөөд буруу (нэвтэрсэн хэрэглэгчийн) дата татах эрсдэлтэй.
  onAddContact?: () => void
  onVcfContact?: () => void
}

const NEU_BG = 'bg-[#e2e8f0]'
const NEU_PRESSED = `${NEU_BG} shadow-[inset_4px_4px_8px_#bec9d8,inset_-4px_-4px_8px_#ffffff]`

const TEMPLATES: Record<CardDesign, typeof NeumorphicCard> = {
  neumorphic: NeumorphicCard,
  cyber: CyberCard,
  abstract: AbstractCard,
  glass: GlassCard,
}

export default function CardPreview({
  user,
  showQr = true,
  qrChildren,
  design = 'neumorphic',
  onAddContact,
  onVcfContact,
}: CardPreviewProps) {
  // Анхдагч (fallback) handler-ууд — зөвхөн нэвтэрсэн хэрэглэгчийн /card
  // хуудсанд зориулагдсан (getVcf() нь auth token-оор одоогийн хэрэглэгчийг
  // тодорхойлдог). onAddContact/onVcfContact props ирвэл тэдгээрийг ашиглана.
  const defaultAddContact = async () => {
    if (!user) return
    try {
      const { content, filename } = await getVcf()
      const blob = new Blob([content], { type: 'text/vcard' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename || `${user.name || 'contact'}.vcf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Харилцагч татагдлаа')
    } catch {
      toast.error('Татахад алдаа гарлаа')
    }
  }

  const defaultVcfContact = async () => {
    try {
      const { content } = await getVcf()
      await navigator.clipboard.writeText(content)
      toast.success('Текст хуулагдлаа — Notepad-д буулгаж болно')
    } catch {
      toast.error('Хуулахад алдаа гарлаа')
    }
  }

  const handleAddContact = onAddContact || defaultAddContact
  const handleVcfContact = onVcfContact || defaultVcfContact

  // Эцэг компонент (CardPage) loading/error төлөвийг барьдаг тул энд зөвхөн
  // user ирээгvй үед богино skeleton харуулна.
  if (!user) {
    return (
      <div className={`w-full max-w-[400px] mx-auto rounded-[44px] ${NEU_BG} border border-white/40 shadow-2xl min-h-[500px] flex items-center justify-center`}>
        <div className={`w-10 h-10 rounded-full ${NEU_PRESSED} border-t-blue-500 border-4 border-transparent animate-spin`} />
      </div>
    )
  }

  const Template = TEMPLATES[design] || NeumorphicCard

  return (
    <Template
      user={user}
      showQr={showQr}
      qrChildren={qrChildren}
      onAddContact={handleAddContact}
      onVcfContact={handleVcfContact}
    />
  )
}
