'use client'

import { Toaster } from 'react-hot-toast'

export default function Toast() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1a1a2e',
          color: '#fff',
          borderRadius: '12px',
          padding: '12px 16px',
        },
        success: {
          iconTheme: {
            primary: '#6C63FF',
            secondary: '#fff',
          },
        },
      }}
    />
  )
}
