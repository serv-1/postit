import PostPageFavoriteButton from '../../components/PostPageFavoriteButton'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import err from '../../utils/constants/errors'
import server from '../../mocks/server'
import { rest } from 'msw'

const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')
const setToast = jest.fn()

beforeEach(() => {
  useToast.mockReturnValue({ setToast })
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

test('the user can add or delete the post to its favorite', async () => {
  render(<PostPageFavoriteButton postId="0" favPostsIds={['0']} />)

  const heartBtn = screen.getByRole('button', { name: /favorite/i })
  const heartFillIcon = screen.getByTestId('heartFill')

  expect(heartBtn).toHaveAttribute('title', 'Delete from favorite')
  expect(heartBtn).toHaveAttribute('aria-label', 'Delete from favorite')
  expect(heartFillIcon.className).not.toContain('animate')

  await userEvent.click(heartBtn)
  await waitFor(() => {
    expect(setToast).toHaveBeenNthCalledWith(1, {
      message:
        'This post has been successfully deleted from your favorite list! 🎉',
    })
  })

  expect(heartBtn).toHaveAttribute('title', 'Add to favorite')
  expect(heartBtn).toHaveAttribute('aria-label', 'Add to favorite')
  expect(heartFillIcon.className).toContain('animate')

  await userEvent.click(heartBtn)
  await waitFor(() => {
    expect(setToast).toHaveBeenNthCalledWith(2, {
      message:
        'This post has been successfully added to your favorite list! 🎉',
    })
  })

  expect(heartBtn).toHaveAttribute('title', 'Delete from favorite')
  expect(heartBtn).toHaveAttribute('aria-label', 'Delete from favorite')
  expect(heartFillIcon.className).not.toContain('animate')
})

test('an error renders if the server fails to update the user favorite post list', async () => {
  server.use(
    rest.put('http://localhost/api/user', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ message: err.DEFAULT }))
    })
  )

  render(<PostPageFavoriteButton postId="0" favPostsIds={['0']} />)

  const heartBtn = screen.getByRole('button', { name: /favorite/i })
  await userEvent.click(heartBtn)

  await waitFor(() => {
    expect(setToast).toHaveBeenNthCalledWith(1, {
      message: err.DEFAULT,
      error: true,
    })
  })
})

test("unauthenticated users can't add the post to their favorite list", async () => {
  render(<PostPageFavoriteButton postId="0" />)

  const heartBtn = screen.getByRole('button', { name: /favorite/i })
  await userEvent.click(heartBtn)

  await waitFor(() => expect(setToast).toHaveBeenCalledTimes(1))
})
