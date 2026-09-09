'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FaThLarge, FaDownload, FaIdCard, FaFileAlt, FaCopy } from 'react-icons/fa'
import Sidebar from '../../components/Sidebar'
import CardPreview from '../../components/CardPreview'
import QRCode from '../../components/QRCode'
import { getCardData, getVcf, getTextContent } from '../../lib/api'
import type { CardData } from '../../lib/types'

export default function CardPage() {
  const [data, setData] = useState<CardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQr, setShowQr] = useState(true)
  const [textContent, setTextContent] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.push('/login')
      return
    }

    getCardData()
      .then((d) => {
        setData(d)
        setTextContent(d.text_content || '')
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

  const handleDownloadQr = () => {
    const svg = document.getElementById('card-qr-svg')
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
    toast.success('QR код татагдлаа')
  }

  const handleDownloadVcf = async () => {
    try {
      const { content, filename } = await getVcf()
      downloadFile(content, filename || 'contact.vcf', 'text/vcard')
      toast.success('vCard татагдлаа')
    } catch {
      toast.error('Татахад алдаа гарлаа')
    }
  }

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(textContent)
      toast.success('Хууллаа')
    } catch {
      toast.error('Хуулахад алдаа гарлаа')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-64 hidden md:block">
        <Sidebar user={data?.user} />
      </div>
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="flex items-center gap-3 text-2xl font-bold text-dark mb-6">
            <FaThLarge className="text-primary" /> Миний Карт &amp; QR
          </h1>

          <div className="grid lg:grid-cols-[400px_1fr] gap-6 items-start">
            <div>
              <CardPreview
                user={data?.user || null}
                showQr={showQr}
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

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="flex items-center gap-2 font-semibold text-dark mb-1">
                  <FaDownload className="text-secondary" /> QR код татаж авах
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  QR кодын зургийг татаж авах бол доорх товчийг дарна уу.
                </p>
                <button
                  onClick={handleDownloadQr}
                  className="flex items-center gap-2 bg-gradient-to-r from-secondary to-pink-400 text-white px-5 py-3 rounded-full font-medium hover:opacity-90"
                >
                  <FaDownload /> QR татаж авах
                </button>
              </div>

              <hr className="border-gray-200" />

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="flex items-center gap-2 font-semibold text-dark mb-1">
                  <FaIdCard className="text-primary" /> VCF файл татаж авах
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Холбоо барих мэдээллийг VCF форматаар татаж авах
                </p>
                <button
                  onClick={handleDownloadVcf}
                  className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-full font-medium hover:bg-primary/90"
                >
                  <FaDownload /> VCF татаж авах
                </button>
              </div>

              <hr className="border-gray-200" />

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="flex items-center gap-2 font-semibold text-dark mb-3">
                  <FaFileAlt className="text-gray-500" /> Текст хэлбэрээр харах
                </h2>
                <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-600 whitespace-pre-wrap font-mono overflow-x-auto">
                  {textContent}
                </pre>
                <button
                  onClick={handleCopyText}
                  className="mt-4 flex items-center gap-2 text-primary text-sm font-medium hover:underline"
                >
                  <FaCopy /> Хуулах
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
