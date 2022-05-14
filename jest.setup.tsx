import '@testing-library/jest-dom/extend-expect'
import { ImageProps } from 'next/image'
import { cloneElement as mockCloneElement, ReactNode } from 'react'
import 'whatwg-fetch'

jest.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="documentTitle">{children}</div>
  ),
}))

jest.mock(
  'next/image',
  () =>
    function Image(
      props: Omit<ImageProps, 'src'> & { src?: string; className?: string }
    ) {
      const { src, alt, title, className } = props
      return <img src={src} alt={alt} title={title} className={className} />
    }
)

jest.mock('next/link', () => {
  return ({ children, href }: { children: JSX.Element; href: string }) =>
    mockCloneElement(children, { href })
})

jest.mock('./components/Header', () => ({
  __esModule: true,
  default: () => <header></header>,
}))
