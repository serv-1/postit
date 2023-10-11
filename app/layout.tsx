import './global.css'
import 'leaflet/dist/leaflet.css'
import { Quicksand } from 'next/font/google'
import { getServerSession } from 'next-auth'
import { nextAuthOptions } from 'app/api/auth/[...nextauth]/route'
import Providers from 'components/Providers'

const quicksand = Quicksand({
  subsets: ['latin'],
  display: 'swap',
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(nextAuthOptions)

  return (
    <html lang="en" className={quicksand.className}>
      <Providers session={session}>{children}</Providers>
    </html>
  )
}
