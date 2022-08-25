import { render, screen, waitFor } from '@testing-library/react'
import HomePostPage from '../../components/HomePostPage'

const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')
const axiosGet = jest.spyOn(require('axios'), 'get')

const searchData = {
  posts: [
    {
      id: '0',
      name: 'Blue cat',
      price: 50,
      image: 'blue-cat.jpeg',
      address: 'Paris, France',
    },
    {
      id: '1',
      name: 'Red cat',
      price: 100,
      image: 'red-cat.jpeg',
      address: 'Oslo, Norway',
    },
  ],
  totalPosts: 2,
  totalPages: 1,
}

const setToast = jest.fn()

beforeEach(() => {
  useToast.mockReturnValue({ setToast })
  axiosGet.mockReturnValue({ data: searchData })
})

it('renders an informative text if no posts have been fetched yet', () => {
  render(<HomePostPage />)
  const text = screen.getByRole('status')
  expect(text).toHaveTextContent(/search something/i)
})

it('renders an informative text if no posts have been found', async () => {
  axiosGet.mockResolvedValue({
    data: { posts: [], totalPosts: 0, totalPages: 0 },
  })

  const search = '?query=ohNooo'
  Object.defineProperty(window, 'location', { get: () => ({ search }) })

  render(<HomePostPage />)

  const text = screen.getByRole('status')
  await waitFor(() => expect(text).toHaveTextContent(/no posts found/i))
})

it("fetches the posts matching the url query string's data", async () => {
  const search = '?query=cat'
  Object.defineProperty(window, 'location', { get: () => ({ search }) })

  render(<HomePostPage />)

  const nbOfPostsFound = await screen.findByText(/2 posts found/i)
  expect(nbOfPostsFound).toBeInTheDocument()

  const post1 = await screen.findByRole('link', { name: /blue cat/i })
  expect(post1).toBeInTheDocument()

  const post2 = await screen.findByRole('link', { name: /red cat/i })
  expect(post2).toBeInTheDocument()
})

it('renders "post" in the singular if there is only one found post', async () => {
  axiosGet.mockResolvedValue({
    data: {
      posts: [
        {
          id: '0',
          name: 'blue cat',
          price: 50,
          image: 'blue-cat.jpeg',
          address: 'Tokyo, Japan',
        },
      ],
      totalPosts: 1,
      totalPages: 1,
    },
  })

  const search = '?query=cat'
  Object.defineProperty(window, 'location', { get: () => ({ search }) })

  render(<HomePostPage />)

  const nbOfPostsFound = await screen.findByText(/1 post found/i)
  expect(nbOfPostsFound).toBeInTheDocument()
})

it('renders an alert if the server fails to fetch the posts', async () => {
  axiosGet.mockRejectedValue({ response: { data: { message: 'error' } } })

  const search = '?oh=no'
  Object.defineProperty(window, 'location', { get: () => ({ search }) })

  render(<HomePostPage />)

  await waitFor(() => {
    const toast = { message: 'error', error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})
