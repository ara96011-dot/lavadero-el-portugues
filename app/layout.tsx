import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lavadero El Portugués | Detailing & Lavado',
  description: 'Lavadero artesanal, detailing profesional',
  keywords: 'lavadero de autos, detailing, lavadero concepcion',
  manifest: '/manifest.json',
  themeColor: '#0A58CA',
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
