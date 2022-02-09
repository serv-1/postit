import { render, screen } from '@testing-library/react'
import Toast from '../../components/Toast'
import { ToastProvider } from '../../contexts/toast'
import { mockSession } from '../../mocks/nextAuth'
import Profile from '../../pages/profile'
import err from '../../utils/constants/errors'
import server from '../../mocks/server'
import { rest } from 'msw'

const useSession = jest.spyOn(require('next-auth/react'), 'useSession')

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('an error renders if the server fails to get the user', async () => {
  useSession.mockReturnValue({ status: 'authenticated', data: mockSession })

  server.use(
    rest.get('http://localhost:3000/api/users/:id', (req, res, ctx) => {
      return res(ctx.status(404), ctx.json({ message: err.USER_NOT_FOUND }))
    })
  )

  render(
    <ToastProvider>
      <Profile />
      <Toast />
    </ToastProvider>
  )

  const toast = await screen.findByRole('alert')
  expect(toast).toHaveTextContent(err.USER_NOT_FOUND)
  expect(toast).toHaveClass('bg-danger')
})
