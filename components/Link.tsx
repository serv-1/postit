import classNames from 'classnames'
import NextLink from 'next/link'
import { ComponentPropsWithoutRef } from 'react'

interface LinkProps extends ComponentPropsWithoutRef<'a'> {
  href: string
  needButtonStyle?: boolean
}

const Link = (props: LinkProps) => {
  const { href, needButtonStyle, className, children, ...rest } = props

  const _className = classNames(
    {
      'block bg-fuchsia-600 text-fuchsia-50 hover:text-fuchsia-900 hover:bg-fuchsia-200 active:bg-fuchsia-900 active:text-fuchsia-200 transition-colors duration-200 px-16 py-8 rounded font-bold':
        needButtonStyle,
    },
    className
  )

  return (
    <NextLink href={href}>
      <a className={_className} {...rest}>
        {children}
      </a>
    </NextLink>
  )
}

export default Link
