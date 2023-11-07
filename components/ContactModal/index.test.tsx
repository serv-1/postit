import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactModal from '.'

const mockSetToast = jest.fn()
const mockUseSession = jest.spyOn(require('next-auth/react'), 'useSession')

jest
  .mock('hooks/useToast', () => ({
    __esModule: true,
    default: () => ({ setToast: mockSetToast, toast: {} }),
  }))
  .mock('components/ChatModal', () => ({
    __esModule: true,
    default: ({ isOpen }: { isOpen: boolean }) =>
      isOpen ? <div role="dialog"></div> : null,
  }))

it('is closed by default', () => {
  mockUseSession.mockReturnValue({ status: 'authenticated' })

  render(<ContactModal postId="0" postName="table" sellerId="0" />)

  const modal = screen.queryByRole('dialog')

  expect(modal).not.toBeInTheDocument()
})

it('renders a floating round button', () => {
  mockUseSession.mockReturnValue({ status: 'authenticated' })

  render(
    <ContactModal postId="0" postName="table" sellerId="0" hasFloatingBtn />
  )

  const btn = screen.getByRole('button')

  expect(btn).toHaveClass('round-btn')
  expect(btn).not.toHaveTextContent(/contact/i)
})

it('renders a primary button', () => {
  mockUseSession.mockReturnValue({ status: 'authenticated' })

  render(<ContactModal postId="0" postName="table" sellerId="0" />)

  const btn = screen.getByRole('button')

  expect(btn).toHaveClass('primary-btn')
  expect(btn).toHaveTextContent(/contact/i)
})

it('opens by clicking on the button if the user is authenticated', async () => {
  mockUseSession.mockReturnValue({ status: 'authenticated' })

  render(<ContactModal postId="0" postName="table" sellerId="0" />)

  const btn = screen.getByRole('button')

  await userEvent.click(btn)

  const modal = screen.getByRole('dialog')

  expect(modal).toBeInTheDocument()
})

it('renders a message after clicking on the button if the user is unauthenticated', async () => {
  mockUseSession.mockReturnValue({ status: 'unauthenticated' })

  render(<ContactModal postId="0" postName="table" sellerId="0" />)

  const btn = screen.getByRole('button')

  await userEvent.click(btn)

  const modal = screen.queryByRole('dialog')

  expect(modal).not.toBeInTheDocument()
  expect(mockSetToast).toHaveBeenCalledTimes(1)
})
