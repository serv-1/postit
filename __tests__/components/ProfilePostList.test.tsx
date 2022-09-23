import {
  render,
  screen,
  waitForElementToBeRemoved,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilePostList from '../../components/ProfilePostList'
import server from '../../mocks/server'
import err from '../../utils/constants/errors'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const axiosDelete = jest.spyOn(require('axios'), 'delete')
const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')
const setToast = jest.fn()

beforeEach(() => useToast.mockReturnValue({ setToast }))

const awsUrl = process.env.NEXT_PUBLIC_AWS_URL + '/'

const posts = [
  { id: '0', name: 'table', image: 'keyName' },
  { id: '1', name: 'chair', image: 'keyName' },
]

const favPosts = [
  { id: '0', name: 'table', image: 'keyName' },
  { id: '1', name: 'chair', image: 'keyName' },
]

it('renders without posts', () => {
  render(<ProfilePostList posts={[]} altText="no posts" />)

  const altText = screen.getByText('no posts')
  expect(altText).toBeInTheDocument()
})

it('renders with posts', () => {
  render(<ProfilePostList posts={posts} altText="no posts" />)

  const links = screen.getAllByRole('link')
  for (let i = 0; i < links.length; i++) {
    expect(links[i]).toHaveAttribute('href', `/posts/${i}/${posts[i].name}`)
  }

  const deleteBtns = screen.getAllByRole('button')
  for (let i = 0; i < deleteBtns.length; i++) {
    expect(deleteBtns[i]).toHaveAccessibleName('Delete ' + posts[i].name)
    expect(deleteBtns[i]).toHaveAttribute('title', 'Delete ' + posts[i].name)
  }

  const images = screen.getAllByRole('img')
  for (let i = 0; i < images.length; i++) {
    expect(images[i]).toHaveAttribute('src', awsUrl + posts[i].image)
  }

  const postName1 = screen.getByText(/table/i)
  expect(postName1).toBeInTheDocument()

  const postName2 = screen.getByText(/chair/i)
  expect(postName2).toBeInTheDocument()
})

it('renders with favorite posts', () => {
  render(<ProfilePostList isFavPost posts={favPosts} altText="no posts" />)

  const links = screen.getAllByRole('link')
  for (let i = 0; i < links.length; i++) {
    expect(links[i]).toHaveAttribute('href', `/posts/${i}/${favPosts[i].name}`)
  }

  const deleteBtns = screen.getAllByRole('button')
  for (let i = 0; i < deleteBtns.length; i++) {
    expect(deleteBtns[i]).toHaveAccessibleName('Delete ' + posts[i].name)
    expect(deleteBtns[i]).toHaveAttribute('title', 'Delete ' + posts[i].name)
  }

  const images = screen.getAllByRole('img')
  for (let i = 0; i < images.length; i++) {
    expect(images[i]).toHaveAttribute('src', awsUrl + favPosts[i].image)
  }

  const postName1 = screen.getByText(/table/i)
  expect(postName1).toBeInTheDocument()

  const postName2 = screen.getByText(/chair/i)
  expect(postName2).toBeInTheDocument()
})

test('the delete button deletes the post', async () => {
  render(<ProfilePostList posts={posts} altText="no posts" />)

  const deleteBtns = screen.getAllByRole('button')
  for (let i = 0; i < deleteBtns.length; i++) {
    await userEvent.click(deleteBtns[i])

    await waitForElementToBeRemoved(() => {
      return screen.getByRole('button', { name: 'Delete ' + posts[i].name })
    })
    expect(setToast).toHaveBeenCalledTimes(i + 1)
  }

  const altText = screen.getByText('no posts')
  expect(altText).toBeInTheDocument()
})

test('the delete button deletes the favorite post', async () => {
  render(<ProfilePostList isFavPost posts={favPosts} altText="no posts" />)

  const deleteBtns = screen.getAllByRole('button')
  for (let i = 0; i < deleteBtns.length; i++) {
    await userEvent.click(deleteBtns[i])

    await waitForElementToBeRemoved(() => {
      return screen.getByRole('button', { name: 'Delete ' + favPosts[i].name })
    })
    expect(setToast).toHaveBeenCalledTimes(i + 1)
  }

  const altText = screen.getByText('no posts')
  expect(altText).toBeInTheDocument()
})

test('an error renders if the server fails to delete the post', async () => {
  axiosDelete.mockRejectedValue({
    response: { data: { message: err.DEFAULT } },
  })

  render(<ProfilePostList posts={posts} altText="no posts" />)

  const deleteBtns = screen.getAllByRole('button')
  await userEvent.click(deleteBtns[0])

  await waitFor(() => {
    expect(setToast).toHaveBeenNthCalledWith(1, {
      message: err.DEFAULT,
      error: true,
    })
  })
})
