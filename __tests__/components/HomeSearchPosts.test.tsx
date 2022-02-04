import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import selectEvent from 'react-select-event'
import HomeSearchPosts from '../../components/HomeSearchPosts'
import Toast from '../../components/Toast'
import { ToastProvider } from '../../contexts/toast'
import { mockResponse } from '../../lib/msw'
import { data } from '../../mocks/posts/search'
import err from '../../utils/constants/errors'

const setPosts = jest.fn()
const setTotalPosts = jest.fn()
const setTotalPages = jest.fn()

const factory = () => {
  render(
    <ToastProvider>
      <HomeSearchPosts
        setPosts={setPosts}
        setTotalPosts={setTotalPosts}
        setTotalPages={setTotalPages}
        currentPage={1}
      />
      <Toast />
    </ToastProvider>
  )
}

test('the form gets the posts', async () => {
  factory()

  const queryInput = screen.getByRole('searchbox')
  userEvent.type(queryInput, 'Car')

  const minPriceInput = screen.getByRole('spinbutton', { name: /minimum/i })
  userEvent.type(minPriceInput, '50')

  const maxPriceInput = screen.getByRole('spinbutton', { name: /maximum/i })
  userEvent.type(maxPriceInput, '200')

  const categoriesSelect = screen.getByRole('combobox')
  await selectEvent.select(categoriesSelect, ['pet', 'cat'])

  const submitBtn = screen.getByRole('button', { name: /search/i })
  userEvent.click(submitBtn)

  await waitFor(() => {
    expect(setPosts).toHaveBeenCalledTimes(1)
    expect(setPosts).toHaveBeenCalledWith(data.posts)
    expect(setTotalPosts).toHaveBeenCalledTimes(1)
    expect(setTotalPosts).toHaveBeenCalledWith(data.totalPosts)
    expect(setTotalPages).toHaveBeenCalledTimes(1)
    expect(setTotalPages).toHaveBeenCalledWith(data.totalPages)
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
