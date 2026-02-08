import ContactButton from '.'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toast from 'components/Toast'
import { useSession } from 'next-auth/react'

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}))

const mockUseSession = vi.mocked(useSession)

it('renders a message on click if the user is unauthenticated', async () => {
  mockUseSession.mockReturnValue({
    update: async () => null,
    data: null,
    status: 'unauthenticated',
  })

  const onClick = vi.fn()

  render(
    <>
      <ContactButton onClick={onClick} />
      <Toast />
    </>,
  )

  const button = screen.getByRole('button')

  await userEvent.click(button)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent(
    'You need to be signed in to discuss with the seller.',
  )

  expect(onClick).not.toHaveBeenCalled()
})

it('calls the onClick handler on click if the user is authenticated', async () => {
  const session = { id: '0', channelName: 'chan0', expires: '' }

  mockUseSession.mockReturnValue({
    update: async () => session,
    data: session,
    status: 'authenticated',
  })

  const onClick = vi.fn()

  render(
    <>
      <ContactButton onClick={onClick} />
      <Toast />
    </>,
  )

  const button = screen.getByRole('button')

  await userEvent.click(button)

  const toast = screen.queryByRole('alert')

  expect(toast).not.toBeInTheDocument()
  expect(onClick).toHaveBeenCalledTimes(1)
})
