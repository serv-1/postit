import PostFavoriteButton from '.'
import setup from 'functions/setup'
import { screen } from '@testing-library/react'
import Toast from 'components/Toast'
import { useSession } from 'next-auth/react'
import ajax from 'libs/ajax'

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  getCsrfToken: async () => 'token',
}))

const mockPut = vi.spyOn(ajax, 'put')
const mockUseSession = vi.mocked(useSession)

it('is not active by default', () => {
  mockUseSession.mockReturnValue({
    update: async () => null,
    data: null,
    status: 'unauthenticated',
  })

  setup(<PostFavoriteButton postId="0" />)

  const button = screen.getByRole('button')
  expect(button).toHaveAttribute('aria-label', 'Add to favorite list')
})

it('renders a message if the user is unauthenticated on click', async () => {
  mockUseSession.mockReturnValue({
    update: async () => null,
    data: null,
    status: 'unauthenticated',
  })

  const { user } = setup(
    <>
      <Toast />
      <PostFavoriteButton postId="0" />
    </>,
  )

  const button = screen.getByRole('button')
  await user.click(button)

  const message = screen.getByRole('alert')
  expect(message).toHaveTextContent('You need to be authenticated.')
})

it('adds the post to the authenticated user favorite list on click', async () => {
  const session = { id: '0', channelName: 'chan0', expires: '' }

  mockPut.mockResolvedValue(new Response(null, { status: 204 }))
  mockUseSession.mockReturnValue({
    update: async () => session,
    data: session,
    status: 'authenticated',
  })

  const { user } = setup(
    <>
      <Toast />
      <PostFavoriteButton postId="0" />
    </>,
  )

  const button = screen.getByRole('button')
  await user.click(button)

  const message = screen.getByRole('alert')
  expect(message).toHaveTextContent(/added to/)

  expect(button).toHaveAttribute('aria-label', 'Delete from favorite list')
})

it('deletes the post from the authenticated user favorite list on click', async () => {
  const session = { id: '0', channelName: 'chan0', expires: '' }

  mockPut.mockResolvedValue(new Response(null, { status: 204 }))
  mockUseSession.mockReturnValue({
    update: async () => session,
    data: session,
    status: 'authenticated',
  })

  const { user } = setup(
    <>
      <Toast />
      <PostFavoriteButton postId="0" isActive />
    </>,
  )

  const button = screen.getByRole('button')
  expect(button).toHaveAttribute('aria-label', 'Delete from favorite list')
  await user.click(button)

  const message = screen.getByRole('alert')
  expect(message).toHaveTextContent(/deleted from/)

  expect(button).toHaveAttribute('aria-label', 'Add to favorite list')
})

it('renders the server error when the request fails', async () => {
  const session = { id: '0', channelName: 'chan0', expires: '' }

  mockPut.mockResolvedValue(
    new Response(JSON.stringify({ message: 'error' }), { status: 422 }),
  )

  mockUseSession.mockReturnValue({
    update: async () => session,
    data: session,
    status: 'authenticated',
  })

  const { user } = setup(
    <>
      <Toast />
      <PostFavoriteButton postId="0" />
    </>,
  )

  const button = screen.getByRole('button')
  await user.click(button)

  const message = screen.getByRole('alert')
  expect(message).toHaveTextContent('error')
})
