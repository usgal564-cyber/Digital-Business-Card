import type { Metadata } from 'next'
import './globals.css'
import Toast from '../components/Toast'
import AppShell from '../components/AppShell'

export const metadata: Metadata = {
  title: 'Digital Business Card',
  description: 'Create your digital business card with QR code',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="mn">
      <body>
        <AppShell>{children}</AppShell>
        <Toast />
      </body>
    </html>
  )
}
