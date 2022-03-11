import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import ProfilePost from '../../components/ProfilePost'
import server from '../../mocks/server'
import err from '../../utils/constants/errors'
import readAsDataUrl from '../../utils/functions/readAsDataUrl'

jest.mock('../../utils/functions/readAsDataUrl')

const mockReadAsDataUrl = readAsDataUrl as jest.MockedFunction<
  typeof readAsDataUrl
>

const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')
const setToast = jest.fn()

beforeEach(() => useToast.mockReturnValue({ setToast }))
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const post = {
  id: 'f0f0f0f0f0f0f0f0f0f0f0f0',
  name: 'Table',
  description: 'Magnificent table',
  categories: ['furniture' as const],
  price: 50,
  images: ['static/images/post/table.jpeg'],
  userId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
}

test("the post's name renders", () => {
  render(<ProfilePost post={post} />)

  const postName = screen.getByText(post.name)
  expect(postName).toBeInTheDocument()
})

test('the edit button opens the update post modal', async () => {
  render(<ProfilePost post={post} />)

  const editBtn = screen.getByRole('button', { name: /edit/i })
  userEvent.click(editBtn)

  await screen.findByTestId('csrfToken')

  const modalTitle = screen.getByRole('heading')
  expect(modalTitle).toBeInTheDocument()
})

test('the form displays the actual post data', async () => {
  render(<ProfilePost post={post} />)

  const editBtn = screen.getByRole('button', { name: /edit/i })
  userEvent.click(editBtn)

  await screen.findByTestId('csrfToken')

  const postNames = screen.getAllByText(post.name)
  expect(postNames).toHaveLength(2)

  const postDescr = screen.getByText(post.description)
  expect(postDescr).toBeInTheDocument()

  const postCategory = screen.getByText(post.categories[0])
  expect(postCategory).toBeInTheDocument()

  const regex = new RegExp(post.price.toString(), 'i')
  const postPrice = screen.getByText(regex)
  expect(postPrice).toBeInTheDocument()

  const postImage = screen.getByRole('img')
  expect(postImage).toHaveAttribute('src', post.images[0])
})

test('an alert renders if the post is updated', async () => {
  render(<ProfilePost post={post} />)

  const editBtn = screen.getByRole('button', { name: /edit/i })
  userEvent.click(editBtn)

  await screen.findByTestId('csrfToken')

  const submitBtn = screen.getByRole('button', { name: /update/i })
  userEvent.click(submitBtn)

  await waitFor(() => expect(setToast).toHaveBeenCalledTimes(1))
})

test('an error renders if the server fails to update the post', async () => {
  server.use(
    rest.put('http://localhost:3000/api/posts/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: err.DEFAULT }))
    })
  )

  render(<ProfilePost post={post} />)

  const editBtn = screen.getByRole('button', { name: /edit/i })
  userEvent.click(editBtn)

  await screen.findByTestId('csrfToken')

  const submitBtn = screen.getByRole('button', { name: /update/i })
  userEvent.click(submitBtn)

  await waitFor(() => {
    const toast = { message: err.DEFAULT, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test('an error renders if the server fails to validate the request data', async () => {
  server.use(
    rest.put('http://localhost:3000/api/posts/:id', (req, res, ctx) => {
      return res(
        ctx.status(422),
        ctx.json({ name: 'name', message: err.NAME_MAX })
      )
    })
  )

  render(<ProfilePost post={post} />)

  const editBtn = screen.getByRole('button', { name: /edit/i })
  userEvent.click(editBtn)

  await screen.findByTestId('csrfToken')

  const submitBtn = screen.getByRole('button', { name: /update/i })
  userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.NAME_MAX)
})

test('an error renders if an image is invalid', async () => {
  render(<ProfilePost post={post} />)

  const editBtn = screen.getByRole('button', { name: /edit/i })
  userEvent.click(editBtn)

  await screen.findByTestId('csrfToken')

  const notImage = new File(['data'], 'text.txt', { type: 'text/plain' })
  const imagesInput = screen.getByLabelText(/images/i)
  userEvent.upload(imagesInput, notImage)

  const submitBtn = screen.getByRole('button', { name: /update/i })
  userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.IMAGE_INVALID)
})

test('an error renders if an image cannot be read as data url', async () => {
  mockReadAsDataUrl.mockResolvedValue('error')

  render(<ProfilePost post={post} />)

  const editBtn = screen.getByRole('button', { name: /edit/i })
  userEvent.click(editBtn)

  await screen.findByTestId('csrfToken')

  const image = new File(['data'], 'img.jpeg', { type: 'image/jpeg' })
  const imagesInput = screen.getByLabelText(/images/i)
  userEvent.upload(imagesInput, image)

  const submitBtn = screen.getByRole('button', { name: /update/i })
  userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent('error')
})
