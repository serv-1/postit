import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfileChangePassword from '../../components/ProfileChangePassword'
import err from '../../utils/constants/errors'
import server from '../../mocks/server'
import { rest } from 'msw'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')

test('an alert renders if the user password is updated', async () => {
  type Update = { message: string; background: string }
  const setToast = jest.fn((update: Update) => update.background)
  useToast.mockReturnValue({ setToast })

  render(<ProfileChangePassword />)

  await screen.findByTestId('csrfToken')

  const input = screen.getByLabelText(/change your password/i)
  userEvent.type(input, 'my new password')

  const submitBtn = screen.getByRole('button', { name: /change/i })
  userEvent.click(submitBtn)

  await waitFor(() => expect(setToast).toHaveNthReturnedWith(1, 'success'))
})

test('an error renders if the server fails to update the user', async () => {
  useToast.mockReturnValue({})

  server.use(
    rest.put('http://localhost:3000/api/user', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ message: err.PASSWORD_MIN }))
    })
  )

  render(<ProfileChangePassword />)

  await screen.findByTestId('csrfToken')

  const input = screen.getByLabelText(/change your password/i)
  userEvent.type(input, 'pw')

  const submitBtn = screen.getByRole('button', { name: /change/i })
  userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.PASSWORD_MIN)

  await waitFor(() => expect(input).toHaveFocus())
})
