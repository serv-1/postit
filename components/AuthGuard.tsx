import { signIn, useSession } from 'next-auth/react'
import { ReactNode, useEffect } from 'react'
import Page403 from '../pages/403'
import Spinner from './Spinner'

interface AuthGuardProps {
  children: ReactNode
  needAuth: boolean
}

const AuthGuard = ({ children, needAuth }: AuthGuardProps) => {
  const { status } = useSession()

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated' && needAuth) {
      signIn()
    }
  }, [status, needAuth])

  if (
    (status === 'authenticated' && needAuth) ||
    (status === 'unauthenticated' && !needAuth)
  ) {
    return <>{children}</>
  } else if (status !== 'loading') {
    return <Page403 />
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
