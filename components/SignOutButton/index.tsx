'use client'

import { signOut } from 'next-auth/react'

interface SignOutButtonProps {
  className?: string
  children: React.ReactNode
}

export default function SignOutButton({
  className,
  children,
}: SignOutButtonProps) {
  return (
    <button
      className={className}
      onClick={() => signOut({ redirectTo: '/' })}
      aria-label="Sign out"
    >
      {children}
    </button>
  )
}
