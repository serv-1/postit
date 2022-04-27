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
    function Image(props: Omit<ImageProps, 'src'> & { src?: string }) {
      return <img src={props.src} alt={props.alt} title={props.title} />
    }
)

jest.mock('next/link', () => {
  return ({ children, href }: { children: JSX.Element; href: string }) =>
    mockCloneElement(children, { href })
})
