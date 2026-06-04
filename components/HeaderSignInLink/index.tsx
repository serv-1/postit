import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export default function HeaderSignInLink() {
  const path = usePathname()

  return (
    path !== '/authentication' && (
      <Link
        href="/authentication"
        className="block bg-fuchsia-600 text-fuchsia-50 hover:text-fuchsia-900 hover:bg-fuchsia-300 active:text-fuchsia-300 active:bg-fuchsia-900 transition-colors duration-200 px-16 py-8 rounded-sm font-bold"
        onClick={(e) => {
          e.preventDefault()
          signIn()
        }}
      >
        Sign in
      </Link>
    )
  )
}
