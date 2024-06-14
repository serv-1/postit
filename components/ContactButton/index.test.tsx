import ContactButton from '.'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockUseSession = jest.spyOn(require('next-auth/react'), 'useSession')
const mockSetToast = jest.fn()

jest.mock('hooks/useToast', () => ({
  __esModule: true,
  default: () => ({ setToast: mockSetToast }),
}))

it('renders a message on click if the user is unauthenticated', async () => {
  mockUseSession.mockReturnValue({ status: 'unauthenticated' })

  const onClick = jest.fn()

  render(<ContactButton onClick={onClick} />)

  const button = screen.getByRole('button')

  await userEvent.click(button)

  expect(mockSetToast).toHaveBeenNthCalledWith(1, {
    message: 'You need to be signed in to discuss with the seller.',
  })

  expect(onClick).not.toHaveBeenCalled()
})

it('calls the onClick handler on click if the user is authenticated', async () => {
  mockUseSession.mockReturnValue({ status: 'authenticated' })

  const onClick = jest.fn()

  render(<ContactButton onClick={onClick} />)

  const button = screen.getByRole('button')

  await userEvent.click(button)

  expect(onClick).toHaveBeenCalledTimes(1)
  expect(mockSetToast).not.toHaveBeenCalled()
})
