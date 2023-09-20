import './global.css'
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
        <div
          className={
            'relative mx-16 grid min-h-screen grid-rows-[auto_1fr_auto]'
          }
        >
          <App session={session}>{children}</App>
          <footer className="text-s p-8">
            <p>
              Copyright © {new Date().getFullYear()} PostIt. All rights
              reserved.
            </p>
          </footer>
        </div>
      </body>
    </html>
  )
}
