import '@testing-library/jest-dom/extend-expect'
import 'whatwg-fetch'
import server from './mocks/server'

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
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
