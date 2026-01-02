import PostFavoriteButton from '.'
import setup from 'functions/setup'
import { screen } from '@testing-library/react'
import Toast from 'components/Toast'
// @ts-expect-error
import { mockGetCsrfToken, mockUseSession } from 'next-auth/react'
import ajax from 'libs/ajax'

const mockPut = jest.spyOn(ajax, 'put')

beforeEach(() => {
  mockGetCsrfToken.mockResolvedValue('token')
})

it('is not active by default', () => {
  mockUseSession.mockReturnValue({ status: 'unauthenticated' })

  setup(<PostFavoriteButton postId="0" />)

  const button = screen.getByRole('button')
  expect(button).toHaveAttribute('aria-label', 'Add to favorite list')
})

it('renders a message if the user is unauthenticated on click', async () => {
  mockUseSession.mockReturnValue({ status: 'unauthenticated' })

  const { user } = setup(
    <>
      <Toast />
      <PostFavoriteButton postId="0" />
    </>
  )

  const button = screen.getByRole('button')
  await user.click(button)

  const message = screen.getByRole('alert')
  expect(message).toHaveTextContent('You need to be authenticated.')
})

it('adds the post to the authenticated user favorite list on click', async () => {
  mockPut.mockResolvedValue(new Response(null, { status: 204 }))
  mockUseSession.mockReturnValue({ status: 'authenticated' })

  const { user } = setup(
    <>
      <Toast />
      <PostFavoriteButton postId="0" />
    </>
  )

  const button = screen.getByRole('button')
  await user.click(button)

  const message = screen.getByRole('alert')
  expect(message).toHaveTextContent(/added to/)

  expect(button).toHaveAttribute('aria-label', 'Delete from favorite list')
})

it('deletes the post from the authenticated user favorite list on click', async () => {
  mockPut.mockResolvedValue(new Response(null, { status: 204 }))
  mockUseSession.mockReturnValue({ status: 'authenticated' })

  const { user } = setup(
    <>
      <Toast />
      <PostFavoriteButton postId="0" isActive />
    </>
  )

  const button = screen.getByRole('button')
  expect(button).toHaveAttribute('aria-label', 'Delete from favorite list')
  await user.click(button)

  const message = screen.getByRole('alert')
  expect(message).toHaveTextContent(/deleted from/)

  expect(button).toHaveAttribute('aria-label', 'Add to favorite list')
})

it('renders the server error when the request fails', async () => {
  mockPut.mockResolvedValue(
    new Response(JSON.stringify({ message: 'error' }), { status: 422 })
  )
  mockUseSession.mockReturnValue({ status: 'authenticated' })

  const { user } = setup(
    <>
      <Toast />
      <PostFavoriteButton postId="0" />
    </>
  )

  const button = screen.getByRole('button')
  await user.click(button)

  const message = screen.getByRole('alert')
  expect(message).toHaveTextContent('error')
})
