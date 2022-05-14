import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toast from '../../components/Toast'

const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')

it('renders and can be closed', async () => {
  const setToast = jest.fn()
  useToast.mockReturnValue({ toast: { message: 'My toast' }, setToast })

  render(<Toast />)

  const toast = screen.getByRole('alert')
  expect(toast).toHaveTextContent('My toast')
  expect(toast).toHaveClass('bg-fuchsia-600')

  const closeBtn = screen.getByRole('button')
  await userEvent.click(closeBtn)

  await waitFor(() => expect(setToast).toHaveBeenNthCalledWith(1, {}))
})

it('is red if error is true', () => {
  useToast.mockReturnValue({ toast: { message: 'error', error: true } })
  render(<Toast />)
  const toast = screen.getByRole('alert')
  expect(toast).toHaveClass('bg-rose-600')
})

it("doesn't render if there is no message to display", () => {
  useToast.mockReturnValue({ toast: {} })
  render(<Toast />)
  const toast = screen.queryByRole('alert')
  expect(toast).not.toBeInTheDocument()
})
