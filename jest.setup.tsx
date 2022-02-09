import '@testing-library/jest-dom/extend-expect'
import { cloneElement as mockCloneElement } from 'react'
import 'whatwg-fetch'
import server from './mocks/server'

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  jest.clearAllMocks()
  jest.resetAllMocks()
})
afterAll(() => server.close())

jest.mock(
  'next/image',
  () =>
    function Image(props: { src: string; alt: string; title: string }) {
      return <img {...props} />
    }
)

jest.mock('next/link', () => {
  return ({ children, href }: { children: JSX.Element; href: string }) =>
    mockCloneElement(children, { href })
})
