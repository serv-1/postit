import './global.css'
import 'leaflet/dist/leaflet.css'
import { Quicksand } from 'next/font/google'
import App from 'app/pages/app'
import { getServerSession } from 'next-auth'
import { nextAuthOptions } from 'app/api/auth/[...nextauth]/route'

const quicksand = Quicksand({
  subsets: ['latin'],
  display: 'swap',
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode & { needAuth?: true | undefined }
}) {
  const session = await getServerSession(nextAuthOptions)

  return (
    <html lang="en" className={quicksand.className}>
      <body>
        <App session={session}>{children}</App>
      </body>
    </html>
  )
}
