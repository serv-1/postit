import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'

const Header = () => {
  const { status } = useSession()

  return (
    <header className="container-fluid d-flex justify-content-between align-items-center mb-4 p-2 shadow-sm">
      <div className="m-0 fs-1">
        <Link href="/">
          <a className="text-decoration-none text-dark">Filanad</a>
        </Link>
      </div>
      <nav>
        {status === 'authenticated' ? (
          <a
            href={'/api/auth/signout'}
            className="btn text-decoration-none text-dark fs-5"
            onClick={(e) => {
              e.preventDefault()
              signOut()
            }}
          >
            Sign out
          </a>
        ) : (
          <a
            href={'/api/auth/signin'}
            className="btn btn-primary text-decoration-none fs-5"
            onClick={(e) => {
              e.preventDefault()
              signIn()
            }}
          >
            Sign in
          </a>
        )}
      </nav>
    </header>
  )
}

export default Header
