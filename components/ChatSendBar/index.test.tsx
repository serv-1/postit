import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatSendBar from '.'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import 'cross-fetch/polyfill'
import discussionsIdHandlers from 'app/api/discussions/[id]/mock'
import { MESSAGE_REQUIRED } from 'constants/errors'

const mockGetCsrfToken = jest.spyOn(require('next-auth/react'), 'getCsrfToken')
const mockSetToast = jest.fn()
const server = setupServer()

jest.mock('hooks/useToast', () => ({
  __esModule: true,
  default: () => ({ setToast: mockSetToast, toast: {} }),
}))

beforeEach(() => {
  mockGetCsrfToken.mockResolvedValue('token')
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('creates a discussion if none exist when the first message is sent', async () => {
  server.use(
    rest.post('http://localhost/api/discussion', async (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(await req.json()).toEqual({
        message: 'hi',
        postId: '0',
        postName: 'table',
        sellerId: '1',
      })

      return res(ctx.status(201), ctx.json({ id: '0' }))
    })
  )

  render(<ChatSendBar postId="0" postName="table" sellerId="1" />)

  const input = screen.getByRole('textbox')

  await userEvent.type(input, 'hi')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)
})

it('renders an alert if the server fails to create a discussion', async () => {
  server.use(
    rest.post('http://localhost/api/discussion', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(<ChatSendBar postId="0" postName="table" sellerId="1" />)

  const input = screen.getByRole('textbox')

  await userEvent.type(input, 'hi')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: 'error',
      error: true,
    })
  })
})

it('updates the discussion with the new message', async () => {
  server.use(
    rest.put('http://localhost/api/discussions/:id', async (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(req.params.id).toBe('0')
      expect(await req.json()).toEqual({ message: 'boo' })

      return res(ctx.status(204))
    })
  )

  render(<ChatSendBar discussionId="0" />)

  const input = screen.getByRole('textbox')

  await userEvent.type(input, 'boo')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)
})

it('renders an alert if the server fails to update the discussion', async () => {
  server.use(
    rest.put('http://localhost/api/discussions/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(<ChatSendBar discussionId="0" />)

  const input = screen.getByRole('textbox')

  await userEvent.type(input, 'boo')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: 'error',
      error: true,
    })
  })
})

it('renders an alert if the given message is invalid', async () => {
  render(<ChatSendBar discussionId="0" />)

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: MESSAGE_REQUIRED,
      error: true,
    })
  })
})

it('resets the input value after that the form is successfully submitted', async () => {
  server.use(...discussionsIdHandlers)

  render(<ChatSendBar discussionId="0" />)

  const input = screen.getByRole<HTMLInputElement>('textbox')

  await userEvent.type(input, 'ah')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  await waitFor(() => expect(input.value).toBe(''))
})
