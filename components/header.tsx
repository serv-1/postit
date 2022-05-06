import classNames from 'classnames'
import { signIn, useSession } from 'next-auth/react'
import { ComponentPropsWithoutRef, ReactNode } from 'react'
import HeaderDropdownMenu from './HeaderDropdownMenu'
import Link from './Link'

interface HeaderWithChildrenProps extends ComponentPropsWithoutRef<'header'> {
  children: ReactNode
  noMenu?: false
}

interface HeaderWithoutChildrenProps
  extends ComponentPropsWithoutRef<'header'> {
  children?: undefined
  noMenu?: boolean
}

type HeaderProps = HeaderWithChildrenProps | HeaderWithoutChildrenProps

const Header = ({ children, noMenu, className, ...props }: HeaderProps) => {
  const { status } = useSession()

  const _className = classNames(
    'p-16 flex items-center',
    noMenu ? 'justify-center' : 'justify-between',
    className
  )

  return (
    <header className={_className} {...props}>
      <Link href="/" className="font-bold text-m-xl md:text-t-xl">
        Filanad
      </Link>
      {noMenu ||
        children ||
        (status === 'unauthenticated' ? (
          <Link
            href="/authentication"
            className="block bg-fuchsia-600 text-fuchsia-50 hover:text-fuchsia-900 hover:bg-fuchsia-300 active:text-fuchsia-300 active:bg-fuchsia-900 transition-colors duration-200 px-16 py-8 rounded font-bold mr-8 md:mr-16 hover:no-underline"
            onClick={(e) => {
              e.preventDefault()
              signIn()
            }}
          >
            Sign in
          </Link>
        ) : status === 'authenticated' ? (
          <nav>
            <ul className="flex items-center h-32 md:h-40">
              <li className="mr-8 md:mr-16">
                <Link
                  href="/create-a-post"
                  className="block bg-fuchsia-600 text-fuchsia-50 hover:text-fuchsia-900 hover:bg-fuchsia-300 active:text-fuchsia-300 active:bg-fuchsia-900 transition-colors duration-200 px-16 py-8 rounded font-bold hover:no-underline"
                >
                  Create a post
                </Link>
              </li>
              <li>
                <HeaderDropdownMenu />
              </li>
            </ul>
          </nav>
        ) : null)}
    </header>
  )
}

export default Header
