import HeaderDropdownMenu from '../../components/HeaderDropdownMenu'
import { render, screen, waitFor } from '@testing-library/react'
import server from '../../mocks/server'
import { mockSession } from '../../mocks/nextAuth'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import err from '../../utils/constants/errors'
import { useToast } from '../../contexts/toast'

jest.mock('../../contexts/toast', () => ({
  useToast: jest.fn(),
}))

const useToastMock = useToast as jest.MockedFunction<typeof useToast>

const useSession = jest.spyOn(require('next-auth/react'), 'useSession')

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const defaultUserImage = process.env.NEXT_PUBLIC_DEFAULT_USER_IMAGE
const awsUrl = process.env.NEXT_PUBLIC_AWS_URL

beforeEach(() => {
  useSession.mockReturnValue({ data: mockSession, status: 'authenticated' })
  useToastMock.mockReturnValue({ toast: {}, setToast() {} })
})

test('the default user image renders', () => {
  render(<HeaderDropdownMenu />)

  const userImage = screen.getByRole('img')
  expect(userImage).toHaveAttribute('src', defaultUserImage)
})

test('the fetched user image renders', async () => {
  render(<HeaderDropdownMenu />)

  const userImage = screen.getByRole('img')
  await waitFor(() => {
    expect(userImage).toHaveAttribute('src', awsUrl + '/keyName')
  })
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
  useToastMock.mockReturnValue({ setToast, toast: {} })

  server.use(
    rest.get('http://localhost/api/users/:id', (req, res, ctx) => {
      return res(ctx.status(404), ctx.json({ message: err.USER_NOT_FOUND }))
    })
  )

  render(<HeaderDropdownMenu />)

  await waitFor(() => {
    const update = { message: err.USER_NOT_FOUND, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, update)
  })
})
