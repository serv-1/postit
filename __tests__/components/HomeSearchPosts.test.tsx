import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import selectEvent from 'react-select-event'
import HomeSearchPosts from '../../components/HomeSearchPosts'
import { data } from '../../mocks/posts/search'
import err from '../../utils/constants/errors'
import server from '../../mocks/server'
import { rest } from 'msw'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const setPosts = jest.fn()
const setTotalPosts = jest.fn()
const setTotalPages = jest.fn()

const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')

beforeEach(() => useToast.mockReturnValue({}))

test('the form gets the posts', async () => {
  render(
    <HomeSearchPosts
      setPosts={setPosts}
      setTotalPosts={setTotalPosts}
      setTotalPages={setTotalPages}
      currentPage={1}
    />
  )

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
    expect(setPosts).toHaveBeenNthCalledWith(1, data.posts)
    expect(setTotalPosts).toHaveBeenNthCalledWith(1, data.totalPosts)
    expect(setTotalPages).toHaveBeenNthCalledWith(1, data.totalPages)
  })
})

test('an error renders if the server fails to get the posts', async () => {
  const setToast = jest.fn()
  useToast.mockReturnValue({ setToast })

  server.use(
    rest.get('http://localhost:3000/api/posts/search', (req, res, ctx) => {
      return res(
        ctx.status(500),
        ctx.json({ message: err.INTERNAL_SERVER_ERROR })
      )
    })
  )
  render(
    <HomeSearchPosts
      setPosts={setPosts}
      setTotalPosts={setTotalPosts}
      setTotalPages={setTotalPages}
      currentPage={1}
    />
  )

  const queryInput = screen.getByRole('searchbox')
  userEvent.type(queryInput, 'Car')

  const submitBtn = screen.getByRole('button')
  userEvent.click(submitBtn)

  await waitFor(() => {
    const update = { message: err.INTERNAL_SERVER_ERROR, background: 'danger' }
    expect(setToast).toHaveBeenNthCalledWith(1, update)
  })
})

test('an error renders if the server fails to validate the data', async () => {
  server.use(
    rest.get('http://localhost:3000/api/posts/search', (req, res, ctx) => {
      return res(
        ctx.status(422),
        ctx.json({ name: 'query', message: err.QUERY_REQUIRED })
      )
    })
  )

  render(
    <HomeSearchPosts
      setPosts={setPosts}
      setTotalPosts={setTotalPosts}
      setTotalPages={setTotalPages}
      currentPage={1}
    />
  )

  const queryInput = screen.getByRole('searchbox')
  userEvent.type(queryInput, 'Car')

  const submitBtn = screen.getByRole('button')
  userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.QUERY_REQUIRED)
})
