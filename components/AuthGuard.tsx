import { signIn, useSession } from 'next-auth/react'
import { ReactNode, useEffect } from 'react'

export interface AuthGuardProps {
  children: ReactNode
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { status } = useSession()

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      signIn()
    }
  }, [status])

  if (status === 'authenticated') {
    return <>{children}</>
  }

  return <div>Loading...</div>
}

export default AuthGuard
