import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatSendBar from '.'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import discussionsIdHandlers from 'app/api/discussions/[id]/mock'
import { MESSAGE_REQUIRED } from 'constants/errors'
import Toast from 'components/Toast'
// @ts-expect-error
import { mockGetCsrfToken } from 'next-auth/react'

const server = setupServer()

beforeEach(() => {
  mockGetCsrfToken.mockResolvedValue('token')
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('creates a discussion if none exist when the first message is sent', async () => {
  server.use(
    http.post('http://localhost/api/discussion', async ({ request }) => {
      expect(request.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(await request.json()).toEqual({
        message: 'hi',
        postId: '0',
        postName: 'table',
        sellerId: '1',
      })

      return HttpResponse.json({ _id: '0' }, { status: 201 })
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
    http.post('http://localhost/api/discussion', () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  render(
    <>
      <ChatSendBar postId="0" postName="table" sellerId="1" />
      <Toast />
    </>
  )

  const input = screen.getByRole('textbox')

  await userEvent.type(input, 'hi')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('error')
})

it('updates the discussion with the new message', async () => {
  server.use(
    http.put(
      'http://localhost/api/discussions/:id',
      async ({ request, params }) => {
        expect(request.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
        expect(params.id).toBe('0')
        expect(await request.json()).toEqual({ message: 'boo' })

        return new HttpResponse(null, { status: 204 })
      }
    )
  )

  render(<ChatSendBar discussionId="0" />)

  const input = screen.getByRole('textbox')

  await userEvent.type(input, 'boo')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)
})

it('renders an alert if the server fails to update the discussion', async () => {
  server.use(
    http.put('http://localhost/api/discussions/:id', () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  render(
    <>
      <ChatSendBar discussionId="0" />
      <Toast />
    </>
  )

  const input = screen.getByRole('textbox')

  await userEvent.type(input, 'boo')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('error')
})

it('renders an alert if the given message is invalid', async () => {
  render(
    <>
      <ChatSendBar discussionId="0" />
      <Toast />
    </>
  )

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  const toast = await screen.findByRole('alert')

  expect(toast).toHaveTextContent(MESSAGE_REQUIRED)
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

it('calls the "onMessageSent" callback when the message is sent', async () => {
  server.use(...discussionsIdHandlers)

  const onMessageSent = jest.fn()

  render(<ChatSendBar discussionId="0" onMessageSent={onMessageSent} />)

  const input = screen.getByRole<HTMLInputElement>('textbox')

  await userEvent.type(input, 'ah')

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  expect(onMessageSent).toHaveBeenNthCalledWith(1, '0')
})
