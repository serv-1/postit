import PostPageFavoriteButton from '.'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import 'cross-fetch/polyfill'
import Toast from 'components/Toast'

const mockGetCsrfToken = jest.spyOn(require('next-auth/react'), 'getCsrfToken')
const server = setupServer()

beforeEach(() => {
  mockGetCsrfToken.mockResolvedValue('token')
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders', () => {
  render(<PostPageFavoriteButton postId="0" />)

  const heartBtn = screen.getByRole('button', { name: /favorite/i })

  expect(heartBtn).toHaveAttribute('title', 'Add to favorite')
  expect(heartBtn).toHaveAttribute('aria-label', 'Add to favorite')

  const heartFillIcon = screen.getByTestId('heartFill')

  expect(heartFillIcon.className).toContain('animate')
})

it("adds the post to the user's favorite list", async () => {
  server.use(
    rest.put('http://localhost/api/user', async (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(await req.json()).toEqual({ favPostId: '0' })

      return res(ctx.status(204))
    })
  )

  render(
    <>
      <Toast />
      <PostPageFavoriteButton postId="0" favPostIds={[]} />
    </>
  )

  const heartBtn = screen.getByRole('button', { name: /favorite/i })

  expect(heartBtn).toHaveAttribute('title', 'Add to favorite')
  expect(heartBtn).toHaveAttribute('aria-label', 'Add to favorite')

  const heartFillIcon = screen.getByTestId('heartFill')

  expect(heartFillIcon.className).toContain('animate')

  await userEvent.click(heartBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent(
    'This post has been successfully added to your favorite list! 🎉'
  )

  expect(heartBtn).toHaveAttribute('title', 'Delete from favorite')
  expect(heartBtn).toHaveAttribute('aria-label', 'Delete from favorite')
  expect(heartFillIcon.className).not.toContain('animate')
})

it("deletes the post from the user's favorite list", async () => {
  server.use(
    rest.put('http://localhost/api/user', async (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(await req.json()).toEqual({ favPostId: '0' })

      return res(ctx.status(204))
    })
  )

  render(
    <>
      <Toast />
      <PostPageFavoriteButton postId="0" favPostIds={['0']} />
    </>
  )

  const heartBtn = screen.getByRole('button', { name: /favorite/i })

  expect(heartBtn).toHaveAttribute('title', 'Delete from favorite')
  expect(heartBtn).toHaveAttribute('aria-label', 'Delete from favorite')

  const heartFillIcon = screen.getByTestId('heartFill')

  expect(heartFillIcon.className).not.toContain('animate')

  await userEvent.click(heartBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent(
    'This post has been successfully deleted from your favorite list! 🎉'
  )

  expect(heartBtn).toHaveAttribute('title', 'Add to favorite')
  expect(heartBtn).toHaveAttribute('aria-label', 'Add to favorite')
  expect(heartFillIcon.className).toContain('animate')
})

it("renders an error if the server fails to update the user's favorite post list", async () => {
  server.use(
    rest.put('http://localhost/api/user', async (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(
    <>
      <Toast />
      <PostPageFavoriteButton postId="0" favPostIds={['0']} />
    </>
  )

  const heartBtn = screen.getByRole('button', { name: /favorite/i })

  await userEvent.click(heartBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('error')
})

it("doesn't update the user's favorite list if he is unauthenticated", async () => {
  render(
    <>
      <Toast />
      <PostPageFavoriteButton postId="0" />
    </>
  )

  const heartBtn = screen.getByRole('button', { name: /favorite/i })

  await userEvent.click(heartBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent(
    'You need to be signed in to add it to your favorite list.'
  )
})
