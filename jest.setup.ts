import '@testing-library/jest-dom/extend-expect'
import 'whatwg-fetch'
import server from './mocks/server'

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  jest.resetAllMocks()
})
afterAll(() => server.close())
