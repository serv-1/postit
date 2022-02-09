import { render, waitFor } from '@testing-library/react'
import { mockSession } from '../../mocks/nextAuth'
import Profile from '../../pages/profile'
import err from '../../utils/constants/errors'
import server from '../../mocks/server'
import { rest } from 'msw'

const useSession = jest.spyOn(require('next-auth/react'), 'useSession')
const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('an error renders if the server fails to get the user', async () => {
  useSession.mockReturnValue({ status: 'authenticated', data: mockSession })
  const setToast = jest.fn()
  useToast.mockReturnValue({ setToast })

  server.use(
    rest.get('http://localhost:3000/api/users/:id', (req, res, ctx) => {
      return res(ctx.status(404), ctx.json({ message: err.USER_NOT_FOUND }))
    })
  )

  render(<Profile />)

  await waitFor(() => {
    const toast = { message: err.USER_NOT_FOUND, background: 'danger' }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})
