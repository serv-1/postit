'use client'

import { NEXT_PUBLIC_VERCEL_URL } from 'env/public'
import type { BuiltInProviderType } from 'next-auth/providers'
import { signIn } from 'next-auth/react'

interface SignInProviderButtonProps {
  id: BuiltInProviderType
  children: React.ReactNode
}

export default function SignInProviderButton({
  id,
  children,
}: SignInProviderButtonProps) {
  return (
    <button
      className="primary-btn w-full"
      onClick={async () => {
        await signIn(id, { callbackUrl: NEXT_PUBLIC_VERCEL_URL + '/profile' })
      }}
    >
      {children}
    </button>
  )
}
