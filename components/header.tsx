import classNames from 'classnames'
import { ComponentPropsWithoutRef, ReactNode } from 'react'
import HeaderDefaultMenu from './HeaderDefaultMenu'
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
      {noMenu || children || <HeaderDefaultMenu />}
    </header>
  )
}

export default Header
