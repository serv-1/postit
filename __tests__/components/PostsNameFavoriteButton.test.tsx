import PostsNameFavoriteButton from '../../components/PostsNameFavoriteButton'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IUser } from '../../types/common'
import err from '../../utils/constants/errors'

const user: IUser = {
  id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
  name: 'Bobby',
  email: 'bobby@bobby.bobby',
  image: '/bobby.jpeg',
  posts: [],
  favPosts: [{ id: '0', name: 'table', image: '/table.jpeg' }],
}

const axiosPut = jest.spyOn(require('axios'), 'put')
const getCsrfToken = jest.spyOn(require('next-auth/react'), 'getCsrfToken')
const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')
const setToast = jest.fn()

beforeEach(() => {
  useToast.mockReturnValue({ setToast })
  getCsrfToken.mockResolvedValue('csrfToken')
})

it('renders', () => {
  render(<PostsNameFavoriteButton postId="0" />)

  const heartBtn = screen.getByRole('button', { name: /favorite/i })
  expect(heartBtn).toHaveAttribute('title', 'Add to favorite')
  expect(heartBtn).toHaveAttribute('aria-label', 'Add to favorite')

  const heartIcons = screen.getAllByTestId(/heart/i)
  expect(heartIcons[0]).not.toHaveClass('opacity-0')
  expect(heartIcons[1]).toHaveClass('opacity-0')
})

test('the user can add or delete the post to its favorite', async () => {
  render(<PostsNameFavoriteButton postId="0" user={user} />)

  let heartBtn = screen.getByRole('button', { name: /favorite/i })
  expect(heartBtn).toHaveAttribute('title', 'Delete from favorite')
  expect(heartBtn).toHaveAttribute('aria-label', 'Delete from favorite')

  let heartIcons = screen.getAllByTestId(/heart/i)
  expect(heartIcons[0]).not.toHaveClass('opacity-0')
  expect(heartIcons[1]).toHaveClass('opacity-0')

  await userEvent.click(heartBtn)
  await waitFor(() => {
    expect(setToast).toHaveBeenNthCalledWith(1, {
      message:
        'This post has been successfully deleted from your favorite list! 🎉',
    })
    expect(axiosPut).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3000/api/user',
      {
        csrfToken: 'csrfToken',
        action: 'pull',
        favPostId: '0',
      }
    )
  })

  heartBtn = screen.getByRole('button', { name: /favorite/i })
  expect(heartBtn).toHaveAttribute('title', 'Add to favorite')
  expect(heartBtn).toHaveAttribute('aria-label', 'Add to favorite')

  heartIcons = screen.getAllByTestId(/heart/i)
  expect(heartIcons[0]).not.toHaveClass('opacity-0')
  expect(heartIcons[1]).toHaveClass('opacity-0')

  await userEvent.click(heartBtn)
  await waitFor(() => {
    expect(setToast).toHaveBeenNthCalledWith(2, {
      message:
        'This post has been successfully added to your favorite list! 🎉',
    })
    expect(axiosPut).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3000/api/user',
      {
        csrfToken: 'csrfToken',
        action: 'push',
        favPostId: '0',
      }
    )
  })

  heartBtn = screen.getByRole('button', { name: /favorite/i })
  expect(heartBtn).toHaveAttribute('title', 'Delete from favorite')
  expect(heartBtn).toHaveAttribute('aria-label', 'Delete from favorite')

  heartIcons = screen.getAllByTestId(/heart/i)
  expect(heartIcons[0]).not.toHaveClass('opacity-0')
  expect(heartIcons[1]).toHaveClass('opacity-0')
})

test('an error renders if the server fails to update the user favorite post list', async () => {
  axiosPut.mockRejectedValue({ response: { data: { message: err.DEFAULT } } })

  render(<PostsNameFavoriteButton postId="0" user={user} />)

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
  render(<PostsNameFavoriteButton postId="0" />)

  const heartBtn = screen.getByRole('button', { name: /favorite/i })
  await userEvent.click(heartBtn)

  await waitFor(() => expect(setToast).toHaveBeenCalledTimes(1))
})
