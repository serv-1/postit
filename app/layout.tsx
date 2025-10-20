import './global.css'
import 'leaflet/dist/leaflet.css'
import { Quicksand } from 'next/font/google'
import { auth } from 'libs/auth'
import Providers from 'components/Providers'
import getUser from 'functions/getUser'
import PageWrapper from 'components/PageWrapper'
import Toast from 'components/Toast'

const quicksand = Quicksand({
  subsets: ['latin'],
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
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
