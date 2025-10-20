import ContactButton from '.'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toast from 'components/Toast'
// @ts-expect-error
import { mockUseSession } from 'next-auth/react'

jest.mock('next-auth/react')

it('renders a message on click if the user is unauthenticated', async () => {
  mockUseSession.mockReturnValue({ status: 'unauthenticated' })

  const onClick = jest.fn()

  render(
    <>
      <ContactButton onClick={onClick} />
      <Toast />
    </>
  )

  const button = screen.getByRole('button')

  await userEvent.click(button)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent(
    'You need to be signed in to discuss with the seller.'
  )

  expect(onClick).not.toHaveBeenCalled()
})

it('calls the onClick handler on click if the user is authenticated', async () => {
  mockUseSession.mockReturnValue({ status: 'authenticated' })

  const onClick = jest.fn()

  render(
    <>
      <ContactButton onClick={onClick} />
      <Toast />
    </>
  )

  const button = screen.getByRole('button')

  await userEvent.click(button)

  const toast = screen.queryByRole('alert')

  expect(toast).not.toBeInTheDocument()
  expect(onClick).toHaveBeenCalledTimes(1)
})
