'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FaThLarge, FaCopy, FaBoxOpen, FaQrcode, FaIdCard, FaTimes, FaMobileAlt, FaCheckCircle } from 'react-icons/fa'
import CardPreview, { CARD_DESIGNS, type CardDesign } from '../../components/CardPreview'
import QRCode from '../../components/QRCode'
import PrintCardPreview from '../../components/PrintCardPreview'
import { getCardData, getQRDesign, updateCardDesign, createCardOrder } from '../../lib/api'
import type { CardData, CardOrderType, QRSubtype, CardOrientation } from '../../lib/types'
import { ORDER_PRICES } from '../../lib/types'

const DESIGN_STORAGE_KEY = 'card_design'

export default function CardPage() {
  const [data, setData] = useState<CardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQr, setShowQr] = useState(true)
  const [design, setDesign] = useState<CardDesign>('neumorphic')
  const [savedDesign, setSavedDesign] = useState<CardDesign | null>(null)
  const [saving, setSaving] = useState(false)
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [orderType, setOrderType] = useState<CardOrderType | null>(null)
  const [qrSubtype, setQrSubtype] = useState<QRSubtype | null>(null)
  const [cardOrientation, setCardOrientation] = useState<CardOrientation | null>(null)
  const [orderAddress, setOrderAddress] = useState('')
  const [orderPhone, setOrderPhone] = useState('')
  const [orderNote, setOrderNote] = useState('')
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const [orderPaid, setOrderPaid] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.push('/login')
      return
    }

    // Хэрэглэгчийн сүүлд хадгалсан загварыг browser-с түр сэргээнэ (сервэрийн
    // хариу ирэх хvртэлх богино зуурын анхны утга) — сервэрээс `card_design`
    // ирмэгц доор дахин давхар шинэчлэгдэнэ.
    const localDesign =
      typeof window !== 'undefined' ? (localStorage.getItem(DESIGN_STORAGE_KEY) as CardDesign | null) : null
    if (localDesign && CARD_DESIGNS.some((d) => d.id === localDesign)) {
      setDesign(localDesign)
      setSavedDesign(localDesign)
    }

    getCardData()
      .then((d) => {
        setData(d)
        // Сервэрт хадгалагдсан загвар байвал (өмнө нь "Хадгалах" дарсан бол)
        // тэрийг эх сурвалж болгоно — localStorage-с давуу эрхтэй.
        const serverDesign = d.user?.card_design
        if (serverDesign && CARD_DESIGNS.some((x) => x.id === serverDesign)) {
          setDesign(serverDesign)
          setSavedDesign(serverDesign)
        }

        // `/api/user/me/card-data`-н дотор орсон qr_design нь хуучирсан байж
        // болзошгvй тул (жишээ нь тухайн endpoint тусад нь кэшлэгддэг бол)
        // QR тохиргоог `/api/card/qr-design`-с ДАВХАР, тусад нь татаж, шинэ
        // утгаар давхарлана — ингэснээр /design хуудсан дээр хийсэн бүх
        // өөрчлөлт (dot/eye хэлбэр, хvрээ, лого гэх мэт) энд найдвартай
        // ирнэ, зөвхөн өнгө биш.
        getQRDesign()
          .then((freshQrDesign) => {
            setData((prev) =>
              prev ? { ...prev, qr_design: { ...prev.qr_design, ...freshQrDesign } } : prev
            )
          })
          .catch(() => {
            // Амжилтгvй бол card-data-с ирсэн анхны qr_design-ээр л хязгаарлагдана
          })
      })
      .catch(() => {
        toast.error('Мэдээлэл авахад алдаа гарлаа')
      })
      .finally(() => setLoading(false))
  }, [router])

  const shareUrl =
    typeof window !== 'undefined' && data
      ? `${window.location.origin}/c/${data.user.id}`
      : ''

  // Товч дарахад ЗӨВХӨН preview дээр шууд солигдоно — сервэрт хадгалагдахгvй.
  // Сервэрт хадгалж, /c/[id] дээр бусдад харагдахын тулд "Хадгалах" товч
  // дарах шаардлагатай (доор handleSaveDesign).
  const handleSelectDesign = (id: CardDesign) => {
    setDesign(id)
  }

  const handleCopyShareLink = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Холбоос хуулагдлаа')
    } catch {
      toast.error('Хуулахад алдаа гарлаа')
    }
  }

  const openOrderModal = () => {
    setOrderType(null)
    setQrSubtype(null)
    setCardOrientation(null)
    setOrderAddress('')
    setOrderPhone(data?.user.phone || '')
    setOrderNote('')
    setOrderPaid(false)
    setOrderModalOpen(true)
  }

  // Хvргэлт (хаяг) шаардсан эсэх: биет QR наалт болон хэвлэмэл карт
  // (аль ч чиглэлээр нь) хvргэлттэй, харин "утсан дээр" QR бол цэвэр
  // дижитал тул хаяг шаардахгvй.
  const needsDelivery = orderType === 'card' || (orderType === 'qr' && qrSubtype === 'physical')

  const orderPriceKey =
    orderType === 'qr' && qrSubtype
      ? `qr:${qrSubtype}`
      : orderType === 'card' && cardOrientation
      ? `card:${cardOrientation}`
      : null
  const orderPrice = orderPriceKey ? ORDER_PRICES[orderPriceKey] : null

  const canSubmitOrder =
    !!orderPrice &&
    orderPhone.trim().length > 0 &&
    (!needsDelivery || orderAddress.trim().length > 0)

  const handleSubmitOrder = async () => {
    if (!orderType || !orderPrice) return
    if (needsDelivery && !orderAddress.trim()) {
      toast.error('Хvргэлтийн хаягаа оруулна уу')
      return
    }
    if (!orderPhone.trim()) {
      toast.error('Холбогдох утасны дугаараа оруулна уу')
      return
    }
    setOrderSubmitting(true)
    try {
      await createCardOrder({
        order_type: orderType,
        qr_subtype: orderType === 'qr' ? qrSubtype || undefined : undefined,
        card_orientation: orderType === 'card' ? cardOrientation || undefined : undefined,
        contact_phone: orderPhone.trim(),
        address: needsDelivery ? orderAddress.trim() : undefined,
        note: orderNote.trim() || undefined,
      })
      // Бодит төлбөрийн систем холбогдоогvй тул энд симуляц хийнэ:
      // захиалга сервэрт "pending" төлөвтэй vvссэний дараа "төлбөр
      // амжилттай" гэсэн харагдацыг харуулна.
      setOrderPaid(true)
    } catch {
      toast.error('Захиалга vvсгэхэд алдаа гарлаа')
    } finally {
      setOrderSubmitting(false)
    }
  }

  const handleSaveDesign = async () => {
    if (!data) return
    setSaving(true)
    try {
      await updateCardDesign(design)
      if (typeof window !== 'undefined') {
        localStorage.setItem(DESIGN_STORAGE_KEY, design)
      }
      setSavedDesign(design)
      toast.success('Загвар хадгалагдлаа')
      // Хадгалсны дараа шинэ загвар бодитоор /c/[id] дээр харагдаж байгааг
      // шууд шалгаж болохоор шинэ таб-д нээнэ ("шууд холбогдоод очно").
      if (typeof window !== 'undefined') {
        window.open(`${window.location.origin}/c/${data.user.id}`, '_blank', 'noopener,noreferrer')
      }
    } catch {
      toast.error('Загвар хадгалахад алдаа гарлаа')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
    <div className="max-w-6xl mx-auto">
          <h1 className="flex items-center gap-3 text-2xl font-bold text-dark mb-6">
            <FaThLarge className="text-primary" /> Миний Карт &amp; QR
          </h1>

          <div className="grid lg:grid-cols-[400px_1fr] gap-6 items-start max-w-4xl mx-auto">
            <div>
              {/* Template selector — сонгосон даруйд баруун талын preview шууд шинэчлэгдэнэ,
                  гэхдээ "Хадгалах" дарж байж бусдад (/c/[id]) харагдана */}
              <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-dark">Загвар сонгох</h2>
                  {design !== savedDesign && (
                    <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      Хадгалагдаагvй өөрчлөлт
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  {CARD_DESIGNS.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleSelectDesign(d.id)}
                      aria-pressed={design === d.id}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        design === d.id
                          ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/30'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleSaveDesign}
                  disabled={saving || design === savedDesign}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-full font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {saving ? 'Хадгалж байна…' : 'Хадгалах'}
                </button>
                <p className="text-[11px] text-gray-400 mt-2 text-center">
                  Хадгалсны дараа таны QR код/линк (/c/{data?.user.id}) дээр энэ загвар шууд харагдана.
                </p>
              </div>

              <CardPreview
                user={data?.user || null}
                showQr={showQr}
                design={design}
                qrChildren={
                  data ? (
                    <QRCode
                      id="card-qr-svg"
                      value={shareUrl || data.user.phone}
                      design={data.qr_design}
                    />
                  ) : undefined
                }
              />
              <div className="mt-4 flex items-center justify-center gap-3 bg-white/0">
                <span className={!showQr ? 'text-gray-400 text-sm' : 'text-sm'}>Нуух</span>
                <button
                  type="button"
                  onClick={() => setShowQr((v) => !v)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    showQr ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                      showQr ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </button>
                <span className={showQr ? 'text-gray-400 text-sm' : 'text-sm'}>Харуулах</span>
              </div>
              <p className="text-center text-xs text-gray-400 mt-1">QR кодыг нуух / харуулах</p>
            </div>

            <div>
              <PrintCardPreview
                user={data?.user || null}
                qrValue={shareUrl || data?.user.phone}
                qrDesign={data?.qr_design}
              />
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-full font-medium text-sm hover:bg-gray-50 shadow-sm transition-colors"
              >
                <FaCopy className="text-primary" /> QR холбоосыг хуулах
              </button>
              <p className="text-center text-xs text-gray-400 mt-2">
                Хэвлэмэл картан дээр хэвлэх зориулалттай холбоосыг (/c/{data?.user.id}) хуулж авах
              </p>

              <button
                type="button"
                onClick={openOrderModal}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-primary text-white px-5 py-3 rounded-full font-semibold text-sm hover:bg-primary/90 shadow-sm transition-colors"
              >
                <FaBoxOpen /> Карт захиалах
              </button>
            </div>
          </div>
    </div>

      {/* Захиалгын modal */}
      {orderModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => !orderSubmitting && setOrderModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Төлбөр амжилттай болсны дараах давхарга — доорх маягтыг
                blur хийж, амжилтын мессежийг дээр нь харуулна. */}
            {orderPaid && (
              <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                <FaCheckCircle className="text-5xl text-emerald-500 mb-4" />
                <h3 className="text-lg font-bold text-dark mb-2">Төлбөр амжилттай хийгдлээ</h3>
                <p className="text-sm text-gray-500 mb-6">
                  {needsDelivery
                    ? 'Таны захиалга 5-10 хоногийн дотор бvртгvvлсэн хаяг дээр хvргэлтээр очих болно.'
                    : 'Таны QR идэвхжсэн бөгөөд утсан дээрээ шууд ашиглах боломжтой боллоо.'}
                </p>
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(false)}
                  className="w-full bg-primary text-white px-5 py-3 rounded-full font-semibold text-sm hover:bg-primary/90"
                >
                  Хаах
                </button>
              </div>
            )}

            <div className={`flex items-center justify-between mb-5 ${orderPaid ? 'invisible' : ''}`}>
              <h2 className="text-lg font-bold text-dark flex items-center gap-2">
                <FaBoxOpen className="text-primary" /> Карт захиалах
              </h2>
              <button
                type="button"
                onClick={() => setOrderModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Хаах"
              >
                <FaTimes />
              </button>
            </div>

            <div className={orderPaid ? 'invisible' : ''}>
              {/* 1-р шат: QR эсвэл Карт сонгох */}
              <p className="text-sm font-medium text-gray-700 mb-3">Захиалгын төрөл сонгох</p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setOrderType('qr')
                    setCardOrientation(null)
                  }}
                  aria-pressed={orderType === 'qr'}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-4 transition-all ${
                    orderType === 'qr'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <FaQrcode className="text-2xl" />
                  <span className="text-sm font-semibold">QR-аар</span>
                  <span className="text-[11px] text-gray-400 text-center">Утсан дээр эсвэл биетээр</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrderType('card')
                    setQrSubtype(null)
                  }}
                  aria-pressed={orderType === 'card'}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-4 transition-all ${
                    orderType === 'card'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <FaIdCard className="text-2xl" />
                  <span className="text-sm font-semibold">Биет карт</span>
                  <span className="text-[11px] text-gray-400 text-center">Хэвлэмэл, хvргэлттэй</span>
                </button>
              </div>

              {/* 2-р шат: QR-ийн дэд сонголт */}
              {orderType === 'qr' && (
                <div className="mb-5">
                  <p className="text-sm font-medium text-gray-700 mb-3">QR-ийг хэрхэн авах вэ?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setQrSubtype('phone')}
                      aria-pressed={qrSubtype === 'phone'}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-3 py-3.5 transition-all ${
                        qrSubtype === 'phone'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <FaMobileAlt className="text-xl" />
                      <span className="text-xs font-semibold">Утсан дээр</span>
                      <span className="text-[11px] text-gray-400">50,000₮</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrSubtype('physical')}
                      aria-pressed={qrSubtype === 'physical'}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-3 py-3.5 transition-all ${
                        qrSubtype === 'physical'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <FaQrcode className="text-xl" />
                      <span className="text-xs font-semibold">Биетээр</span>
                      <span className="text-[11px] text-gray-400">70,000₮</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2-р шат: Картын чиглэл */}
              {orderType === 'card' && (
                <div className="mb-5">
                  <p className="text-sm font-medium text-gray-700 mb-3">Картын чиглэл</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCardOrientation('vertical')}
                      aria-pressed={cardOrientation === 'vertical'}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-3 py-3.5 transition-all ${
                        cardOrientation === 'vertical'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xs font-semibold">▯ Босоо</span>
                      <span className="text-[11px] text-gray-400">80,000₮</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardOrientation('horizontal')}
                      aria-pressed={cardOrientation === 'horizontal'}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-3 py-3.5 transition-all ${
                        cardOrientation === 'horizontal'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xs font-semibold">▭ Хэвтээ</span>
                      <span className="text-[11px] text-gray-400">80,000₮</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 3-р шат: хаяг, утас, тайлбар */}
              {orderPrice && (
                <div className="space-y-4 border-t border-gray-100 pt-4">
                  {needsDelivery && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Хvргэлтийн хаягийн дэлгэрэнгvй
                      </label>
                      <input
                        type="text"
                        value={orderAddress}
                        onChange={(e) => setOrderAddress(e.target.value)}
                        placeholder="Дvvрэг, хороо, байр, орц гэх мэт"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Утасны дугаар</label>
                    <input
                      type="text"
                      value={orderPhone}
                      onChange={(e) => setOrderPhone(e.target.value)}
                      placeholder="9911xxxx"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Дэлгэрэнгvй мэдээлэл <span className="text-gray-400 font-normal">(заавал биш)</span>
                    </label>
                    <textarea
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-sm font-medium text-gray-600">Нийт vнэ</span>
                    <span className="text-lg font-bold text-dark">{orderPrice.toLocaleString()}₮</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={!canSubmitOrder || orderSubmitting}
                className="mt-5 w-full flex items-center justify-center gap-2 bg-primary text-white px-5 py-3 rounded-full font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {orderSubmitting ? 'Төлбөр тооцож байна…' : orderPrice ? `${orderPrice.toLocaleString()}₮ төлөх` : 'Төлбөр төлөх'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
