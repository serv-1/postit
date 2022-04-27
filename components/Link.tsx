import classNames from 'classnames'
import NextLink from 'next/link'
import { ComponentPropsWithoutRef } from 'react'

interface LinkProps extends ComponentPropsWithoutRef<'a'> {
  href: string
}

const Link = ({ href, className, children, ...rest }: LinkProps) => {
  return (
    <NextLink href={href}>
      <a className={classNames('hover:underline', className)} {...rest}>
        {children}
      </a>
    </NextLink>
  )
}

export default Link
