import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lavadero El Portugués | Detailing & Lavado Profesional de Autos',
  description: 'Lavadero artesanal, detailing profesional, tratamiento cerámico, encerado y limpieza de tapizados. Turnos online y atención de primera calidad.',
  keywords: 'lavadero de autos, detailing, lavadero el portugues, tratamiento ceramico, limpieza de tapizados, turnos lavadero',
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
