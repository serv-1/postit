import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomeSearchPosts from '../../components/HomeSearchPosts'
import Toast from '../../components/Toast'
import { ToastProvider } from '../../contexts/toast'
import { mockResponse } from '../../lib/msw'
import { posts } from '../../mocks/posts/search'
import err from '../../utils/constants/errors'

const setPosts = jest.fn()

const factory = () => {
  render(
    <ToastProvider>
      <HomeSearchPosts setPosts={setPosts} />
      <Toast />
    </ToastProvider>
  )
}

test('the form gets the posts', async () => {
  factory()

  const queryInput = screen.getByRole('searchbox')
  userEvent.type(queryInput, 'Car')

  const submitBtn = screen.getByRole('button')
  userEvent.click(submitBtn)

  await waitFor(() => {
    expect(setPosts).toHaveBeenCalledTimes(1)
    expect(setPosts).toHaveBeenCalledWith(posts)
  })
})

test('an error renders if the server fails to get the posts', async () => {
  mockResponse('get', '/api/posts/search', 500, {
    message: err.INTERNAL_SERVER_ERROR,
  })

  factory()

  const queryInput = screen.getByRole('searchbox')
  userEvent.type(queryInput, 'Car')

  const submitBtn = screen.getByRole('button')
  userEvent.click(submitBtn)

  const toast = await screen.findByRole('alert')
  expect(toast).toHaveTextContent(err.INTERNAL_SERVER_ERROR)
  expect(toast).toHaveClass('bg-danger')
})

test('an error renders if the server fails to validate the data', async () => {
  mockResponse('get', '/api/posts/search', 422, {
    name: 'query',
    message: err.QUERY_REQUIRED,
  })

  factory()

  const queryInput = screen.getByRole('searchbox')
  userEvent.type(queryInput, 'Car')

  const submitBtn = screen.getByRole('button')
  userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.QUERY_REQUIRED)
  expect(alert).not.toHaveClass('bg-danger')
})
