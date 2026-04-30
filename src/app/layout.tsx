import type { Metadata } from 'next'
import { Nunito, Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Distric Internet',
  description: 'Platform manajemen layanan WiFi lokal Distric Net.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${poppins.variable} ${nunito.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
