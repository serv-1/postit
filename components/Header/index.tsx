import Link from 'next/link'
import { usePathname } from 'next/navigation'
import classNames from 'classnames'
import type { User } from 'types'
import HeaderDiscussions from 'components/HeaderDiscussions'
import HeaderAccountMenu from 'components/HeaderAccountMenu'
import PlusCircleSvg from 'components/PlusCircleSvg'
import { POST_PAGE_REGEX } from 'constants/regex'
import HeaderLogo from 'components/HeaderLogo'
import HeaderSignInLink from 'components/HeaderSignInLink'

interface HeaderProps {
  signedInUser?: User
}

export default function Header({ signedInUser }: HeaderProps) {
  const path = usePathname()

  return (
    <header
      className={classNames(
        path.match(POST_PAGE_REGEX) ? 'hidden md:flex' : 'flex',
        'items-center p-16 mt-auto',
      )}
    >
      <HeaderLogo />
      {signedInUser ? (
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
                <PlusCircleSvg className="w-full h-full" />
              </Link>
            </li>
            <li>
              <HeaderAccountMenu userImage={signedInUser.image} />
            </li>
          </ul>
        </nav>
      ) : (
        <HeaderSignInLink />
      )}
    </header>
  )
}
