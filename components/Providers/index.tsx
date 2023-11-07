'use client'

import Toast from 'components/Toast'
import ToastProvider from 'components/ToastProvider'
import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session | null
}) {
  return (
    <SessionProvider session={session}>
      <ToastProvider>
        <Toast />
        {children}
      </ToastProvider>
    </SessionProvider>
  )
}
