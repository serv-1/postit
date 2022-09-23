import '@testing-library/jest-dom/extend-expect'
import { ImageProps } from 'next/image'
import { cloneElement as mockCloneElement, ReactNode } from 'react'
import 'whatwg-fetch'
import { loadEnvConfig } from '@next/env'

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

jest.mock('nanoid', () => ({ __esModule: true, nanoid: () => '_nanoid_mock' }))

jest.mock('./components/MapFlyToLatLon', () => ({
  __esModule: true,
  default: () => <div data-testid="mapFlyToLatLon"></div>,
}))

jest.mock('./components/MapInvalidateSize', () => ({
  __esModule: true,
  default: () => <div data-testid="mapInvalidateSize"></div>,
}))

export default async function _loadEnvConfig() {
  loadEnvConfig(process.cwd())
}
