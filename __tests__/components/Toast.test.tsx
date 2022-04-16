import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toast from '../../components/Toast'

const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')

test('the toast renders and the close button closes it', async () => {
  const setToast = jest.fn()
  useToast.mockReturnValue({ toast: { message: 'My toast' }, setToast })

  render(<Toast />)

  const toast = screen.getByRole('alert')
  expect(toast).toHaveTextContent('My toast')
  expect(toast).toHaveClass('bg-indigo-200')

  const closeBtn = screen.getByRole('button')
  await userEvent.click(closeBtn)

  await waitFor(() => expect(setToast).toHaveBeenNthCalledWith(1, {}))
})

test('the toast is red if error is true', () => {
  const setToast = jest.fn()
  useToast.mockReturnValue({ toast: { message: 'error', error: true } })

  render(<Toast />)

  const toast = screen.getByRole('alert')
  expect(toast).toHaveClass('bg-red-500')
})

test("the toast doesn't render if there is no message to display", () => {
  useToast.mockReturnValue({ toast: {} })

  render(<Toast />)

  const toast = screen.queryByRole('alert')
  expect(toast).not.toBeInTheDocument()
})
