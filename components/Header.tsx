import { signIn, useSession } from 'next-auth/react'
import HeaderDropdownMenu from './HeaderDropdownMenu'
import Link from './Link'
import PlusCircle from '../public/static/images/plus-circle.svg'
import dynamic from 'next/dynamic'

const HeaderChatListModal = dynamic(() => import('./HeaderChatListModal'), {
  ssr: false,
})

const Header = () => {
  const { status } = useSession()

  return (
    <header className="w-full flex items-center justify-between p-16">
      <Link
        href="/"
        className="font-bold text-m-xl md:text-t-xl hover:text-fuchsia-600 transition-colors duration-200"
      >
        Filanad
      </Link>
      {status === 'unauthenticated' ? (
        <Link
          href="/authentication"
          className="block bg-fuchsia-600 text-fuchsia-50 hover:text-fuchsia-900 hover:bg-fuchsia-300 active:text-fuchsia-300 active:bg-fuchsia-900 transition-colors duration-200 px-16 py-8 rounded font-bold mr-8 md:mr-16"
          onClick={(e) => {
            e.preventDefault()
            signIn()
          }}
        >
          Sign in
        </Link>
      ) : status === 'authenticated' ? (
        <nav>
          <ul className="flex flex-row flew-nowrap gap-x-8 items-center">
            <li>
              <HeaderChatListModal />
            </li>
            <li>
              <Link
                href="/create-a-post"
                className="text-fuchsia-600 w-40 h-40 block hover:text-fuchsia-900 transition-colors duration-200"
                aria-label="Create a post"
              >
                <PlusCircle className="w-full h-full" />
              </Link>
            </li>
            <li>
              <HeaderDropdownMenu />
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  )
}
export default Header
