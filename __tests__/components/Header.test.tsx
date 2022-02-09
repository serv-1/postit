import { render, screen, waitFor } from '@testing-library/react'
import Header from '../../components/Header'
import { mockSession } from '../../mocks/nextAuth'
import err from '../../utils/constants/errors'
import server from '../../mocks/server'
import { rest } from 'msw'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')
const useRouter = jest.spyOn(require('next/router'), 'useRouter')
const useSession = jest.spyOn(require('next-auth/react'), 'useSession')

beforeEach(() => {
  useSession.mockReturnValue({ data: undefined, status: 'loading' })
  useRouter.mockReturnValue({ pathname: '/' })
  useToast.mockReturnValue({})
})

test('nothing render while the session is loading', () => {
  render(<Header />)

  const list = screen.getByRole('list')
  expect(list).toBeEmptyDOMElement()
})

test('the user image loads then renders if the user is authenticated', async () => {
  useSession.mockReturnValue({ data: mockSession, status: 'authenticated' })

  render(<Header />)

  const spinner = screen.getByRole('status')
  expect(spinner).toBeInTheDocument()

  const image = await screen.findByRole('img')
  expect(image).toBeInTheDocument()
})

test("if the user is on it's profile the dropdown menu does not render but the sign out link renders", () => {
  const setToast = jest.fn()
  useToast.mockReturnValue({ setToast })

  server.use(
    rest.get('http://localhost:3000/api/users/:id', (req, res, ctx) => {
      return res(ctx.status(404), ctx.json({ message: err.USER_NOT_FOUND }))
    })
  )

  useRouter.mockReturnValue({ pathname: '/profile' })
  useSession.mockReturnValue({ data: mockSession, status: 'authenticated' })

  render(<Header />)

  const signOutLink = screen.getByRole('link', { name: /sign out/i })
  expect(signOutLink).toBeInTheDocument()

  const dropDownBtn = screen.queryByRole('button')
  expect(dropDownBtn).not.toBeInTheDocument()

  // verify that getImage() in useEffect has not been called
  expect(setToast).not.toHaveBeenCalled()
})

test('an error renders if the server fails to fetch the user image', async () => {
  const setToast = jest.fn()
  useToast.mockReturnValue({ setToast })

  server.use(
    rest.get('http://localhost:3000/api/users/:id', (req, res, ctx) => {
      return res(ctx.status(404), ctx.json({ message: err.USER_NOT_FOUND }))
    })
  )

  useSession.mockReturnValue({ data: mockSession, status: 'authenticated' })

  render(<Header />)

  await waitFor(() => {
    const update = { message: err.USER_NOT_FOUND, background: 'danger' }
    expect(setToast).toHaveBeenNthCalledWith(1, update)
  })

  const spinner = screen.getByRole('status')
  expect(spinner).toBeInTheDocument()
})

test('the sign in link renders when the user is unauthenticated', () => {
  useSession.mockReturnValue({ data: null, status: 'unauthenticated' })

  render(<Header />)

  const signInLink = screen.getByRole('link', { name: /sign in/i })
  expect(signInLink).toBeInTheDocument()
})
