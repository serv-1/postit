import { signIn, useSession } from 'next-auth/react'
import { ReactNode, useEffect } from 'react'

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
        <div
          className="w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full border-8 border-fuchsia-200 border-r-fuchsia-400 animate-spin"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </main>
  )
}

export default AuthGuard
