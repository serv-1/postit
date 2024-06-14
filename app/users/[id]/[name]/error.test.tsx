import { render, screen } from '@testing-library/react'
import RouteError from './error'
import userEvent from '@testing-library/user-event'

it("renders the error's message", () => {
  render(<RouteError error={new Error('oh no!')} reset={() => null} />)

  const title = screen.getByRole('heading', { level: 1 })

  expect(title).toHaveTextContent('oh no!')
})

it('resets', async () => {
  const mockReset = jest.fn()

  render(<RouteError error={new Error('')} reset={mockReset} />)

  const tryAgainBtn = screen.getByRole('button', { name: /try again/i })

  await userEvent.click(tryAgainBtn)

  expect(mockReset).toHaveBeenCalledTimes(1)
})
