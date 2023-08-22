'use client'

import AuthGuard from 'components/AuthGuard'
import Toast from 'components/Toast'
import { ToastProvider } from 'contexts/toast'
import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'

export default function App({
  children,
  session,
}: {
  children: React.ReactNode & { needAuth?: true | undefined }
  session: Session | null
}) {
  return (
    <SessionProvider session={session}>
      <ToastProvider>
        <Toast />
        {children.needAuth ? <AuthGuard>{children}</AuthGuard> : children}
      </ToastProvider>
    </SessionProvider>
  )
}
