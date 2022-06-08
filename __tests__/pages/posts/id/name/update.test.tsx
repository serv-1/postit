import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import server from '../../../../../mocks/server'
import UpdatePost from '../../../../../pages/posts/[id]/[name]/update'
import err from '../../../../../utils/constants/errors'
import readAsDataUrl from '../../../../../utils/functions/readAsDataUrl'

jest.mock('../../../../../utils/functions/readAsDataUrl')

const mockReadAsDataUrl = readAsDataUrl as jest.MockedFunction<
  typeof readAsDataUrl
>

const useToast = jest.spyOn(
  require('../../../../../contexts/toast'),
  'useToast'
)
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
  price: 5000,
  images: ['static/images/post/table.jpeg'],
  location: 'Oslo, Norway',
  userId: 'f0f0f0f0f0f0f0f0f0f0f0f0',
}

it('renders', async () => {
  render(<UpdatePost post={post} />)

  const documentTitle = screen.getByTestId('documentTitle')
  expect(documentTitle).toHaveTextContent(post.name)

  const nameBtn = screen.getByRole('button', { name: /name/i })
  await userEvent.click(nameBtn)

  const actualName = screen.getByText(post.name)
  expect(actualName).toBeInTheDocument()

  const descriptionBtn = screen.getByRole('button', { name: /description/i })
  await userEvent.click(descriptionBtn)

  const actualDescription = screen.getByText(post.description)
  expect(actualDescription).toBeInTheDocument()

  const categoriesBtn = screen.getByRole('button', { name: /categories/i })
  await userEvent.click(categoriesBtn)

  const actualCategories = screen.getByText(post.categories.join(', '))
  expect(actualCategories).toBeInTheDocument()

  const priceBtn = screen.getByRole('button', { name: /price/i })
  await userEvent.click(priceBtn)

  const actualPrice = screen.getByText('5 000€')
  expect(actualPrice).toBeInTheDocument()

  const imagesBtn = screen.getByRole('button', { name: /images/i })
  await userEvent.click(imagesBtn)

  const image = screen.getByRole('img')
  expect(image).toHaveAttribute('src', post.images[0])

  const locationBtn = screen.getByRole('button', { name: /location/i })
  await userEvent.click(locationBtn)

  const location = screen.getByText(post.location)
  expect(location).toBeInTheDocument()
})

test('an alert renders if the post is updated', async () => {
  render(<UpdatePost post={post} csrfToken="csrf" />)

  const nameBtn = screen.getByRole('button', { name: /name/i })
  await userEvent.click(nameBtn)

  const inputName = screen.getByRole('textbox', { name: /name/i })
  await userEvent.type(inputName, 'Garden gnome')

  const submitBtn = screen.getByRole('button', { name: /update/i })
  await userEvent.click(submitBtn)

  await waitFor(() => expect(setToast).toHaveBeenCalledTimes(1))
})

test('an error renders if the server fails to update the post', async () => {
  server.use(
    rest.put('http://localhost:3000/api/posts/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: err.DEFAULT }))
    })
  )

  render(<UpdatePost post={post} csrfToken="csrf" />)

  const submitBtn = screen.getByRole('button', { name: /update/i })
  await userEvent.click(submitBtn)

  await waitFor(() => {
    const toast = { message: err.DEFAULT, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test("an error renders if the server fails to validate the request's data", async () => {
  server.use(
    rest.put('http://localhost:3000/api/posts/:id', (req, res, ctx) => {
      return res(
        ctx.status(422),
        ctx.json({ name: 'name', message: err.NAME_MAX })
      )
    })
  )

  render(<UpdatePost post={post} csrfToken="csrf" />)

  const nameBtn = screen.getByRole('button', { name: /name/i })
  await userEvent.click(nameBtn)

  const nameInput = screen.getByRole('textbox')
  await userEvent.type(nameInput, 'Gnome Garden')

  const submitBtn = screen.getByRole('button', { name: /update/i })
  await userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.NAME_MAX)
})

test('an error renders if an image is invalid', async () => {
  render(<UpdatePost post={post} csrfToken="csrf" />)

  const imagesBtn = screen.getByRole('button', { name: /images/i })
  await userEvent.click(imagesBtn)

  const file = new File(['data'], 'text.txt', { type: 'text/plain' })
  const imagesInput = screen.getByLabelText(/new images/i)
  await userEvent.upload(imagesInput, file)

  const submitBtn = screen.getByRole('button', { name: /update/i })
  await userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.IMAGE_INVALID)
})

test("an error renders if an image can't be read as data url", async () => {
  mockReadAsDataUrl.mockResolvedValue('error')

  render(<UpdatePost post={post} csrfToken="csrf" />)

  const imagesBtn = screen.getByRole('button', { name: /images/i })
  await userEvent.click(imagesBtn)

  const file = new File(['data'], 'img.jpeg', { type: 'image/jpeg' })
  const imagesInput = screen.getByLabelText(/new images/i)
  await userEvent.upload(imagesInput, file)

  const submitBtn = screen.getByRole('button', { name: /update/i })
  await userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent('error')
})
