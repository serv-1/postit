import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import classNames from 'classnames'
import type { User } from 'types'
import HeaderDiscussions from 'components/HeaderDiscussions'
import HeaderAccountMenu from 'components/HeaderAccountMenu'
import PlusCircle from 'public/static/images/plus-circle.svg'
import { POST_PAGE_REGEX } from 'constants/regex'

interface HeaderProps {
  signedInUser?: User
}

export default function Header({ signedInUser }: HeaderProps) {
  const path = usePathname()
  const isOnAuthPage = path === '/authentication'

  return (
    <header
      className={classNames(
        path.match(POST_PAGE_REGEX) ? 'hidden md:flex' : 'flex',
        isOnAuthPage ? 'justify-center' : 'justify-between',
        'items-center p-16 mt-auto'
      )}
    >
      <Link
        href="/"
        className="font-bold text-m-xl md:text-t-xl hover:text-fuchsia-600 transition-colors duration-200"
      >
        PostIt
      </Link>
      {!signedInUser && !isOnAuthPage ? (
        <Link
          href="/authentication"
          className="block bg-fuchsia-600 text-fuchsia-50 hover:text-fuchsia-900 hover:bg-fuchsia-300 active:text-fuchsia-300 active:bg-fuchsia-900 transition-colors duration-200 px-16 py-8 rounded font-bold"
          onClick={(e) => {
            e.preventDefault()
            signIn()
          }}
        >
          Sign in
        </Link>
      ) : signedInUser ? (
        <nav>
          <ul className="flex flex-row flew-nowrap gap-x-8 items-center">
            <li>
              <HeaderDiscussions signedInUser={signedInUser} />
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
              <HeaderAccountMenu userImage={signedInUser.image} />
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  )
}
