import HeaderDropdownMenu from '../../components/HeaderDropdownMenu'
import { render, screen, waitFor } from '@testing-library/react'
import server from '../../mocks/server'
import { mockSession } from '../../mocks/nextAuth'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import err from '../../utils/constants/errors'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')
const useSession = jest.spyOn(require('next-auth/react'), 'useSession')

beforeEach(() => {
  useSession.mockReturnValue({ data: mockSession, status: 'authenticated' })
  useToast.mockReturnValue({})
})

test('the user image loads', async () => {
  render(<HeaderDropdownMenu />)

  const pulser = screen.getByRole('status')
  expect(pulser).toBeInTheDocument()

  const userImage = await screen.findByRole('img')
  expect(userImage).toHaveAttribute('src')
})

test('the sign out link signs out the user', async () => {
  const signOut = jest.spyOn(require('next-auth/react'), 'signOut')
  signOut.mockImplementation(() => null)

  render(<HeaderDropdownMenu />)

  const openBtn = screen.getByRole('button')
  await userEvent.click(openBtn)

  const signOutLink = screen.getByRole('link', { name: /sign out/i })
  await userEvent.click(signOutLink)

  expect(signOut).toHaveBeenCalledTimes(1)
})

test('an error renders if the server fails to fetch the user image', async () => {
  const setToast = jest.fn()
  useToast.mockReturnValue({ setToast })

  server.use(
    rest.get('http://localhost:3000/api/users/:id', (req, res, ctx) => {
      return res(ctx.status(404), ctx.json({ message: err.USER_NOT_FOUND }))
    })
  )

  render(<HeaderDropdownMenu />)

  await waitFor(() => {
    const update = { message: err.USER_NOT_FOUND, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, update)
  })

  const pulser = screen.getByRole('status')
  expect(pulser).toBeInTheDocument()
})
