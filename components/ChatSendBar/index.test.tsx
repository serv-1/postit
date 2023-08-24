import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatSendBar from '.'
import err from 'utils/constants/errors'

const mockSetToast = jest.fn()

jest.mock('contexts/toast', () => ({
  useToast: () => ({ setToast: mockSetToast, toast: {} }),
}))

const axiosPost = jest.spyOn(require('axios'), 'post')
const axiosPut = jest.spyOn(require('axios'), 'put')

beforeEach(() => {
  axiosPost.mockResolvedValue({})
  axiosPut.mockResolvedValue({})
})

it('creates a discussion if none exist when the first message is sent', async () => {
  const props = {
    csrfToken: 'token',
    postId: '0',
    postName: 'table',
    sellerId: '1',
  }

  render(<ChatSendBar {...props} />)

  const input = screen.getByRole('textbox')
  await userEvent.type(input, 'hi')

  const submitBtn = screen.getByRole('button')
  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(axiosPost).toHaveBeenCalledTimes(1)
    expect(axiosPost.mock.calls[0][1]).toEqual({ message: 'hi', ...props })
  })
})

it('renders an alert if the server fails to create a discussion', async () => {
  axiosPost.mockRejectedValue({ response: { data: { message: 'error' } } })

  render(
    <ChatSendBar csrfToken="token" postId="0" postName="table" sellerId="1" />
  )

  const input = screen.getByRole('textbox')
  await userEvent.type(input, 'hi')

  const submitBtn = screen.getByRole('button')
  await userEvent.click(submitBtn)

  await waitFor(() => {
    const toast = { message: 'error', error: true }
    expect(mockSetToast).toHaveBeenNthCalledWith(1, toast)
  })
})

it('updates the discussion with the new message', async () => {
  render(<ChatSendBar csrfToken="token" discussionId="0" />)

  const input = screen.getByRole('textbox')
  await userEvent.type(input, 'boo')

  const submitBtn = screen.getByRole('button')
  await userEvent.click(submitBtn)

  await waitFor(() => {
    const payload = { message: 'boo', csrfToken: 'token' }
    expect(axiosPut).toHaveBeenNthCalledWith(1, '/api/discussions/0', payload)
  })
})

it('renders an alert if the server fails to update the discussion', async () => {
  axiosPut.mockRejectedValue({ response: { data: { message: 'error' } } })

  render(<ChatSendBar csrfToken="token" discussionId="0" />)

  const input = screen.getByRole('textbox')
  await userEvent.type(input, 'boo')

  const submitBtn = screen.getByRole('button')
  await userEvent.click(submitBtn)

  await waitFor(() => {
    const toast = { message: 'error', error: true }
    expect(mockSetToast).toHaveBeenNthCalledWith(1, toast)
  })
})

it('renders an alert if the given message is invalid', async () => {
  render(<ChatSendBar csrfToken="token" discussionId="0" />)

  const submitBtn = screen.getByRole('button')
  await userEvent.click(submitBtn)

  await waitFor(() => {
    const toast = { message: err.MESSAGE_REQUIRED, error: true }
    expect(mockSetToast).toHaveBeenNthCalledWith(1, toast)
  })
})

it('resets the input value after that the form is successfully submitted', async () => {
  render(<ChatSendBar csrfToken="token" discussionId="0" />)

  const input = screen.getByRole<HTMLInputElement>('textbox')
  await userEvent.type(input, 'ah')

  const submitBtn = screen.getByRole('button')
  await userEvent.click(submitBtn)

  await waitFor(() => expect(input.value).toBe(''))
})
