import { signIn, useSession } from 'next-auth/react'
import { ReactNode, useEffect } from 'react'
import Spinner from './Spinner'

interface AuthGuardProps {
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

  return (
    <main className="flex-grow flex justify-center items-center">
      <div className="w-64 h-64">
        <Spinner />
      </div>
    </main>
  )
}

export default AuthGuard
