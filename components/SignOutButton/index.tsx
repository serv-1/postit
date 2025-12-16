'use client'

import { signOut } from 'next-auth/react'

export default function SignOutButton({
  children,
  ...props
}: React.ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      {...props}
      onClick={() => signOut({ redirectTo: '/' })}
      aria-label="Sign out"
    >
      {children}
    </button>
  )
}
