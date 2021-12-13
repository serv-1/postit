import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'

const Header = () => {
  const { data } = useSession()

  return (
    <header className="container-fluid d-flex justify-content-between align-items-center mb-4 p-2 shadow-sm">
      <h1 className="m-0">
        <Link href="/">
          <a className="text-decoration-none text-dark">Filanad</a>
        </Link>
      </h1>
      <div>
        {data ? (
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
          <>
            <a
              href={'/api/auth/signin'}
              className="btn text-decoration-none text-dark fs-5"
              onClick={(e) => {
                e.preventDefault()
                signIn()
              }}
            >
              Sign in
            </a>
            <Link href="/register">
              <a className="ms-3 btn btn-primary border-3 fs-5">Register</a>
            </Link>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
