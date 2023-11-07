import { render, screen } from '@testing-library/react'
import PreviousPageButton from '.'
import userEvent from '@testing-library/user-event'

it('redirects the user to the previous page by clicking on it', async () => {
  const mockBack = jest.fn()

  Object.defineProperty(window, 'history', { value: { back: mockBack } })

  render(<PreviousPageButton />)

  const btn = screen.getByRole('button')

  await userEvent.click(btn)

  expect(mockBack).toHaveBeenCalledTimes(1)
})
