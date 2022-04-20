import HeaderDefaultMenu from '../../components/HeaderDefaultMenu'
import server from '../../mocks/server'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockSession } from '../../mocks/nextAuth'
import { rest } from 'msw'
import err from '../../utils/constants/errors'

jest.mock('react-popper', () => ({
  __esModule: true,
  usePopper: () => ({ styles: {}, attributes: {} }),
}))

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')
const useRouter = jest.spyOn(require('next/router'), 'useRouter')
const useSession = jest.spyOn(require('next-auth/react'), 'useSession')

beforeEach(() => {
  useSession.mockReturnValue({ data: null, status: 'loading' })
  useRouter.mockReturnValue({ pathname: '/' })
  useToast.mockReturnValue({})
})

it("doesn't render while the session is loading", () => {
  render(<HeaderDefaultMenu />)

  const nav = screen.getByRole('navigation')
  expect(nav).toBeEmptyDOMElement()
})

it('renders the sign in link if the user is unauthenticated', async () => {
  useSession.mockReturnValue({ data: null, status: 'unauthenticated' })
  const signIn = jest.spyOn(require('next-auth/react'), 'signIn')
  signIn.mockImplementation(() => null)

  render(<HeaderDefaultMenu />)

  const signInLink = screen.getByRole('link', { name: /sign in/i })
  expect(signInLink).toBeInTheDocument()

  await userEvent.click(signInLink)
  expect(signIn).toHaveBeenCalledTimes(1)
})

it('renders the dropdown menu if the user is authenticated', async () => {
  useSession.mockReturnValue({ data: mockSession, status: 'authenticated' })

  render(<HeaderDefaultMenu />)

  await screen.findByRole('img')

  const list = screen.getByRole('list')
  expect(list).toBeInTheDocument()
})

test('the user image loads', async () => {
  useSession.mockReturnValue({ data: mockSession, status: 'authenticated' })

  render(<HeaderDefaultMenu />)

  const spinner = screen.getByRole('status')
  expect(spinner).toBeInTheDocument()

  const image = await screen.findByRole('img')
  expect(image).toBeInTheDocument()
})

test('the button opens and closes the dropdown menu on click', async () => {
  useSession.mockReturnValue({ data: mockSession, status: 'authenticated' })

  render(<HeaderDefaultMenu />)

  let btn = screen.getByRole('button')
  await userEvent.click(btn)

  const profileLink = screen.getByRole('link', { name: /profile/i })
  expect(profileLink).toBeInTheDocument()

  await userEvent.click(btn)
  expect(profileLink).not.toBeInTheDocument()
})

test("clicking outside the dropdown menu close it but clicking inside shouldn't", async () => {
  useSession.mockReturnValue({ data: mockSession, status: 'authenticated' })

  const { container } = render(<HeaderDefaultMenu />)

  const btn = screen.getByRole('button')
  await userEvent.click(btn)

  let profileLink = screen.getByRole('link', { name: /profile/i })
  expect(profileLink).toBeInTheDocument()

  await userEvent.click(container)

  expect(profileLink).not.toBeInTheDocument()
  await userEvent.click(btn)

  profileLink = screen.getByRole('link', { name: /profile/i })
  expect(profileLink).toBeInTheDocument()

  const menu = screen.getAllByRole('list')[1]
  await userEvent.click(menu)

  expect(profileLink).toBeInTheDocument()
})

test('the sign out link signs out the user', async () => {
  useSession.mockReturnValue({ data: mockSession, status: 'authenticated' })
  const signOut = jest.spyOn(require('next-auth/react'), 'signOut')
  signOut.mockImplementation(() => null)

  render(<HeaderDefaultMenu />)

  const btn = screen.getByRole('button')
  await userEvent.click(btn)

  const signOutLink = screen.getByRole('link', { name: /sign out/i })
  await userEvent.click(signOutLink)

  expect(signOut).toHaveBeenCalledTimes(1)
})

test('an error renders if the server fails to fetch the user image', async () => {
  useSession.mockReturnValue({ data: mockSession, status: 'authenticated' })
  const setToast = jest.fn()
  useToast.mockReturnValue({ setToast })

  server.use(
    rest.get('http://localhost:3000/api/users/:id', (req, res, ctx) => {
      return res(ctx.status(404), ctx.json({ message: err.USER_NOT_FOUND }))
    })
  )

  render(<HeaderDefaultMenu />)

  await waitFor(() => {
    const update = { message: err.USER_NOT_FOUND, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, update)
  })

  const spinner = screen.getByRole('status')
  expect(spinner).toBeInTheDocument()
})
