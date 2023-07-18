import './global.css'
import { Quicksand } from 'next/font/google'
import App from 'app/pages/app'

const quicksand = Quicksand({
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode & { needAuth?: true | undefined }
}) {
  return (
    <html lang="en" className={quicksand.className}>
      <body>
        <App>{children}</App>
      </body>
    </html>
  )
}
