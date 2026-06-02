import Link from 'next/link'
import { usePathname } from 'next/navigation'
import classNames from 'classnames'

export default function HeaderLogo() {
  const path = usePathname()

  return (
    <Link
      href="/"
      className={classNames(
        'grow font-bold text-m-xl md:text-t-xl transition-colors duration-200 hover:text-fuchsia-600',
        path === '/authentication' && 'text-center',
      )}
    >
      PostIt
    </Link>
  )
}
