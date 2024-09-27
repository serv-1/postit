import './global.css'
import 'leaflet/dist/leaflet.css'
import { Quicksand } from 'next/font/google'
import { getServerSession } from 'next-auth'
import { nextAuthOptions } from 'app/api/auth/[...nextauth]/route'
import Providers from 'components/Providers'
import getUser from 'functions/getUser'
import PageWrapper from 'components/PageWrapper'
import Toast from 'components/Toast'

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
  const signedInUser = session ? await getUser(session.id) : undefined

  return (
    <html lang="en" className={quicksand.className}>
      <body>
        <Providers session={session}>
          <PageWrapper signedInUser={signedInUser}>{children}</PageWrapper>
        </Providers>
        <Toast />
      </body>
    </html>
  )
}
