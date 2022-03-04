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
      'bg-indigo-600 text-white px-8 py-4 rounded': needButtonStyle,
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
