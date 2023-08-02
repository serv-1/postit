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
        <div
          className={
            'relative mx-16 grid min-h-screen grid-rows-[auto_1fr_auto]'
          }
        >
          <Toast />
          {children.needAuth ? <AuthGuard>{children}</AuthGuard> : children}
          <footer className="text-s p-8">
            <p>
              Copyright © {new Date().getFullYear()} PostIt. All rights
              reserved.
            </p>
          </footer>
        </div>
      </ToastProvider>
    </SessionProvider>
  )
}
