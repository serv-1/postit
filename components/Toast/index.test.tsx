import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toast from '.'
import showToast from 'functions/showToast'
import { act } from 'react'

it("doesn't render if there is no message to display", () => {
  render(<Toast />)

  const toast = screen.queryByRole('alert')

  expect(toast).not.toBeInTheDocument()
})

it('renders a default toast', async () => {
  render(<Toast />)

  await act(async () => {
    showToast({ message: 'message' })
  })

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('message')
  expect(toast).toHaveClass('bg-fuchsia-600')
})

it('renders an error toast', async () => {
  render(<Toast />)

  await act(async () => {
    showToast({ message: 'error', error: true })
  })

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('error')
  expect(toast).toHaveClass('bg-rose-600')
})

it('closes after clicking the close button', async () => {
  render(<Toast />)

  await act(async () => {
    showToast({ message: 'message' })
  })

  const closeBtn = screen.getByRole('button')

  await userEvent.click(closeBtn)

  expect(closeBtn).not.toBeInTheDocument()
})

it('stops rendering after 5 seconds', async () => {
  jest.useFakeTimers()
  render(<Toast />)

  await act(async () => {
    showToast({ message: 'message' })
  })

  const toast = screen.getByRole('alert')

  await act(async () => {
    jest.advanceTimersByTime(5000)
  })

  expect(toast).not.toBeInTheDocument()
})
