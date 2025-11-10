import { render, screen } from '@testing-library/react'
import Page from './page'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: () => undefined }),
}))

it('renders the send reset password link form if the token is undefined', async () => {
  render(await Page({ searchParams: Promise.resolve({}) }))

  const form = screen.getByRole('form')

  expect(form).toHaveAttribute('name', 'sendResetPasswordLink')
})

it('renders the reset password form if the token is defined', async () => {
  render(
    await Page({
      searchParams: Promise.resolve({ token: 'token', userId: '0' }),
    })
  )

  const form = screen.getByRole('form')

  expect(form).toHaveAttribute('name', 'resetPassword')
})
