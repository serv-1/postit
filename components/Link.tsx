import NextLink from 'next/link'
import { ComponentPropsWithoutRef } from 'react'

interface LinkProps extends ComponentPropsWithoutRef<'a'> {
  href: string
}

const Link = ({ href, children, ...rest }: LinkProps) => {
  return (
    <NextLink href={href} {...rest}>
      {children}
    </NextLink>
  )
}

export default Link
