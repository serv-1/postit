import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/client'

const Header = () => {
  const [session] = useSession()

  return (
    <header className="container-fluid d-flex justify-content-between align-items-center mb-4 p-2 shadow-sm">
      <h1 className="m-0">
        <Link href="/">
          <a className="text-decoration-none text-dark">Filanad</a>
        </Link>
      </h1>
      <div>
        {session ? (
          <a
            href={'/api/auth/logout'}
            className="btn text-decoration-none text-dark fs-5"
            onClick={(e) => {
              e.preventDefault()
              signOut()
            }}
          >
            Log out
          </a>
        ) : (
          <>
            <a
              href={'/api/auth/login'}
              className="btn text-decoration-none text-dark fs-5"
              onClick={(e) => {
                e.preventDefault()
                signIn()
              }}
            >
              Log in
            </a>
            <Link href="/signup">
              <a className="ms-3 btn btn-primary border-3 fs-5">Sign up</a>
            </Link>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
