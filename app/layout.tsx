import './global.css'
import { Quicksand } from 'next/font/google'
import App from 'app/pages/app'
import { getSession } from 'next-auth/react'

const quicksand = Quicksand({
  subsets: ['latin'],
  display: 'swap',
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode & { needAuth?: true | undefined }
}) {
  const session = await getSession()

  return (
    <html lang="en" className={quicksand.className}>
      <body>
        <App session={session}>{children}</App>
      </body>
    </html>
  )
}
