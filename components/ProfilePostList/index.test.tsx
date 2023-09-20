import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilePostList from '.'
import { setupServer } from 'msw/node'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import { rest } from 'msw'
import 'cross-fetch/polyfill'

const mockGetCsrfToken = jest.spyOn(require('next-auth/react'), 'getCsrfToken')
const mockSetToast = jest.fn()
const server = setupServer()

jest.mock('contexts/toast', () => ({
  useToast: () => ({ setToast: mockSetToast, toast: {} }),
}))

beforeEach(() => {
  mockGetCsrfToken.mockResolvedValue('token')
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders without posts', () => {
  render(<ProfilePostList posts={[]} altText="no posts" />)

  const altText = screen.getByText('no posts')

  expect(altText).toBeInTheDocument()
})

it('renders with some posts', () => {
  const posts = [
    { id: '0', name: 'table', image: 'table.jpeg' },
    { id: '1', name: 'chair', image: 'chair.jpeg' },
  ]

  render(<ProfilePostList posts={posts} altText="no posts" />)

  const tableName = screen.getByText(/table/i)

  expect(tableName).toBeInTheDocument()

  const chairName = screen.getByText(/chair/i)

  expect(chairName).toBeInTheDocument()

  const tableLink = screen.getByRole('link', { name: /table/i })

  expect(tableLink).toHaveAttribute('href', '/posts/0/table')

  const chairLink = screen.getByRole('link', { name: /chair/i })

  expect(chairLink).toHaveAttribute('href', '/posts/1/chair')

  const deleteTableBtn = screen.getByRole('button', { name: /table/i })

  expect(deleteTableBtn).toHaveAccessibleName('Delete table')
  expect(deleteTableBtn).toHaveAttribute('title', 'Delete table')

  const deleteChairBtn = screen.getByRole('button', { name: /chair/i })

  expect(deleteChairBtn).toHaveAccessibleName('Delete chair')
  expect(deleteChairBtn).toHaveAttribute('title', 'Delete chair')

  const tableImage = screen.getByAltText('table')

  expect(tableImage).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/table.jpeg')

  const chairImage = screen.getByAltText('chair')

  expect(chairImage).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/chair.jpeg')
})

it('deletes one post', async () => {
  server.use(
    rest.delete('http://localhost/api/posts/:id', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(req.params.id).toBe('0')

      return res(ctx.status(204))
    })
  )

  const posts = [
    { id: '0', name: 'table', image: 'img' },
    { id: '1', name: 'chair', image: 'img' },
  ]

  render(<ProfilePostList posts={posts} altText="no posts" />)

  const deleteBtn = screen.getByRole('button', { name: /table/i })

  await userEvent.click(deleteBtn)

  expect(deleteBtn).not.toBeInTheDocument()

  const chair = screen.getByText('chair')

  expect(chair).toBeInTheDocument()
})

it('deletes one favorite post', async () => {
  server.use(
    rest.put('http://localhost/api/user', async (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(await req.json()).toEqual({ favPostId: '0' })

      return res(ctx.status(204))
    })
  )

  const posts = [
    { id: '0', name: 'table', image: 'img' },
    { id: '1', name: 'chair', image: 'img' },
  ]

  render(<ProfilePostList isFavPost posts={posts} altText="no posts" />)

  const deleteBtn = screen.getByRole('button', { name: /table/i })

  await userEvent.click(deleteBtn)

  expect(deleteBtn).not.toBeInTheDocument()

  const chair = screen.getByText('chair')

  expect(chair).toBeInTheDocument()
})

it('renders an error if the server fails to delete one post', async () => {
  server.use(
    rest.delete('http://localhost/api/posts/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(
    <ProfilePostList
      posts={[{ id: '0', name: 'table', image: 'img' }]}
      altText="no posts"
    />
  )

  const deleteBtn = screen.getByRole('button', { name: /table/i })

  await userEvent.click(deleteBtn)

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: 'error',
      error: true,
    })
  })

  expect(deleteBtn).toBeInTheDocument()
})

it('renders an error if the server fails to delete one favorite post', async () => {
  server.use(
    rest.put('http://localhost/api/user', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(
    <ProfilePostList
      isFavPost
      posts={[{ id: '0', name: 'table', image: 'img' }]}
      altText="no posts"
    />
  )

  const deleteBtn = screen.getByRole('button', { name: /table/i })

  await userEvent.click(deleteBtn)

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: 'error',
      error: true,
    })
  })

  expect(deleteBtn).toBeInTheDocument()
})
