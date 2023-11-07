import HeaderDropdownMenu from '.'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'
import 'cross-fetch/polyfill'

const mockUseSession = jest.spyOn(require('next-auth/react'), 'useSession')
const mockSignOut = jest.spyOn(require('next-auth/react'), 'signOut')
const mockSetToast = jest.fn()
const server = setupServer()

jest.mock('hooks/useToast', () => ({
  __esModule: true,
  default: () => ({ setToast: mockSetToast, toast: {} }),
}))

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it("renders the default user image if it doesn't have one", async () => {
  server.use(
    rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
      expect(req.params.id).toBe('0')

      return res(ctx.status(200), ctx.json({}))
    })
  )

  mockUseSession.mockReturnValue({ data: { id: '0' } })

  render(<HeaderDropdownMenu />)

  const userImage = screen.getByRole('img')

  expect(userImage).toHaveAttribute('src', NEXT_PUBLIC_DEFAULT_USER_IMAGE)
})

it('renders the user image', async () => {
  server.use(
    rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
      expect(req.params.id).toBe('0')

      return res(ctx.status(200), ctx.json({ image: 'john.jpeg' }))
    })
  )

  mockUseSession.mockReturnValue({ data: { id: '0' } })

  render(<HeaderDropdownMenu />)

  const userImage = screen.getByRole('img')

  await waitFor(() => {
    expect(userImage).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/john.jpeg')
  })
})

it('signs the user out', async () => {
  server.use(
    rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
      expect(req.params.id).toBe('0')

      return res(ctx.status(200), ctx.json({}))
    })
  )

  mockUseSession.mockReturnValue({ data: { id: '0' } })

  render(<HeaderDropdownMenu />)

  const openBtn = screen.getByRole('button')

  await userEvent.click(openBtn)

  const signOutLink = screen.getByRole('link', { name: /sign out/i })

  await userEvent.click(signOutLink)

  expect(mockSignOut).toHaveBeenNthCalledWith(1, { callbackUrl: '/' })
})

it('renders an error if the server fails to fetch the user image', async () => {
  server.use(
    rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  mockUseSession.mockReturnValue({ data: { id: '0' } })

  render(<HeaderDropdownMenu />)

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: 'error',
      error: true,
    })
  })
})
