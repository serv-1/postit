import { signIn, useSession } from 'next-auth/react'
import { useEffect } from 'react'

const AuthGuard = ({ children }: { children: JSX.Element }) => {
  const { status } = useSession()

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      signIn(undefined, {
        callbackUrl: 'http://localhost:3000/api/auth/signin',
      })
    }
  }, [status])

  if (status === 'authenticated') {
    return children
  }

  return <div>Loading...</div>
}

export default AuthGuard
