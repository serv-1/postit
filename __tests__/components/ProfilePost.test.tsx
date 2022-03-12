import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import ProfilePost from '../../components/ProfilePost'
import { ToastState } from '../../contexts/toast'
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
  categories: ['furniture' as const, 'pet' as const],
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

test('the delete button deletes the post', async () => {
  const setToast = jest.fn((update: ToastState) => update.error)
  useToast.mockReturnValue({ setToast })

  render(<ProfilePost post={post} />)

  const deleteBtn = screen.getByRole('button', { name: /delete/i })
  userEvent.click(deleteBtn)

  await waitFor(() => {
    expect(setToast).toHaveNthReturnedWith(1, undefined)
  })
})

test('an error renders if the server fails to delete the post', async () => {
  server.use(
    rest.delete('http://localhost:3000/api/posts/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: err.DEFAULT }))
    })
  )

  render(<ProfilePost post={post} />)

  const deleteBtn = screen.getByRole('button', { name: /delete/i })
  userEvent.click(deleteBtn)

  await waitFor(() => {
    const toast = { message: err.DEFAULT, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
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

  const postCategory = screen.getByText(
    `${post.categories[0]}, ${post.categories[1]}`
  )
  expect(postCategory).toBeInTheDocument()

  const regex = new RegExp(post.price.toString(), 'i')
  const postPrice = screen.getByText(regex)
  expect(postPrice).toBeInTheDocument()

  const postImage = screen.getByRole('img')
  expect(postImage).toHaveAttribute('src', post.images[0])
})

test('an alert renders if the post is updated and the new value is shown instead of the old one', async () => {
  render(<ProfilePost post={post} />)

  const editBtn = screen.getByRole('button', { name: /edit/i })
  userEvent.click(editBtn)

  await screen.findByTestId('csrfToken')

  const inputName = screen.getByRole('textbox', { name: /name/i })
  userEvent.type(inputName, 'Garden gnome')

  const submitBtn = screen.getByRole('button', { name: /update/i })
  userEvent.click(submitBtn)

  await waitFor(() => expect(setToast).toHaveBeenCalledTimes(1))

  const newNameText = screen.getAllByText(/garden gnome/i)
  expect(newNameText).toHaveLength(2)
})

test('the new images are shown instead of the old ones', async () => {
  mockReadAsDataUrl.mockResolvedValue({ base64: 'sfksdf', ext: 'jpeg' })

  render(<ProfilePost post={post} />)

  const editBtn = screen.getByRole('button', { name: /edit/i })
  userEvent.click(editBtn)

  await screen.findByTestId('csrfToken')

  const image = new File(['data'], 'img.jpeg', { type: 'image/jpeg' })

  const fileInput = screen.getByLabelText(/images/i)
  userEvent.upload(fileInput, image)

  const oldImgSrc = screen.getByRole('img').getAttribute('src')

  const submitBtn = screen.getByRole('button', { name: /update/i })
  userEvent.click(submitBtn)

  await waitFor(() => {
    const newImgSrc = screen.getByRole('img').getAttribute('src')
    expect(newImgSrc).not.toBe(oldImgSrc)
  })
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
