import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toast from '../../components/Toast'

const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')

test('the alert renders and is removed on click on the close button', async () => {
  const setToast = jest.fn()
  useToast.mockReturnValue({ toast: { message: 'My toast' }, setToast })

  render(<Toast />)

  let alert: HTMLElement | null = screen.getByRole('alert')
  expect(alert).toHaveTextContent('My toast')
  expect(alert).toHaveClass('bg-primary', 'text-white')

  const closeBtn = screen.getByRole('button')
  expect(closeBtn).toHaveClass('btn-close-white')

  userEvent.click(closeBtn)

  await waitFor(() => {
    expect(setToast).toHaveBeenCalledTimes(1)
    expect(setToast).toHaveBeenCalledWith({ message: null })
  })
})

test('the alert do not render if there is no message to display', () => {
  useToast.mockReturnValue({ toast: { message: null } })

  render(<Toast />)

  const alert = screen.queryByRole('alert')
  expect(alert).not.toBeInTheDocument()
})

test('the alert use the given background color with the related text color', () => {
  useToast.mockReturnValue({
    toast: { message: 'My toast', background: 'white' },
  })

  render(<Toast />)

  const alert = screen.getByRole('alert')
  expect(alert).toHaveClass('bg-white')
  expect(alert).not.toHaveClass('text-white')

  const closeBtn = screen.getByRole('button')
  expect(closeBtn).not.toHaveClass('btn-close-white')
})
