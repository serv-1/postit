import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateAPost from '../../pages/create-a-post'
import selectEvent from 'react-select-event'
import err from '../../utils/constants/errors'
import server from '../../mocks/server'
import { rest } from 'msw'
import readAsDataUrl from '../../utils/functions/readAsDataUrl'

jest.mock('../../utils/functions/readAsDataUrl')

const mockReadAsDataUrl = readAsDataUrl as jest.MockedFunction<
  typeof readAsDataUrl
>

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const files: File[] = []

for (let i = 0; i < 3; i++) {
  const name = `image-${i}`
  files.push(new File([name], name + '.jpeg', { type: 'image/jpeg' }))
}

const useRouter = jest.spyOn(require('next/router'), 'useRouter')
const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')

const router = { push: jest.fn() }

beforeEach(() => {
  useRouter.mockReturnValue(router)
  useToast.mockReturnValue({})
})

test("the user is redirected to it's profile after a valid submission", async () => {
  render(<CreateAPost />)

  await screen.findByTestId('csrfToken')

  const nameInput = screen.getByRole('textbox', { name: /name/i })
  userEvent.type(nameInput, 'Modern table')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })
  userEvent.type(descriptionInput, 'A magnificent modern table.')

  await selectEvent.select(screen.getByLabelText('Categories'), 'furniture')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })
  userEvent.type(priceInput, '40')

  const imagesInput = screen.getByLabelText(/images/i)
  userEvent.upload(imagesInput, files)

  const submitBtn = screen.getByRole('button', { name: /create/i })
  userEvent.click(submitBtn)

  await waitFor(() => {
    expect(router.push).toHaveBeenNthCalledWith(1, '/profile')
  })
})

test('an error renders for the images field if an image is invalid', async () => {
  render(<CreateAPost />)

  await screen.findByTestId('csrfToken')

  const nameInput = screen.getByRole('textbox', { name: /name/i })
  userEvent.type(nameInput, 'Modern table')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })
  userEvent.type(descriptionInput, 'A magnificent modern table.')

  await selectEvent.select(screen.getByLabelText('Categories'), 'furniture')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })
  userEvent.type(priceInput, '40')

  const textFile = new File(['invalid'], 'invalid')
  const imagesInput = screen.getByLabelText(/images/i)
  userEvent.upload(imagesInput, textFile)

  const submitBtn = screen.getByRole('button', { name: /create/i })
  userEvent.click(submitBtn)

  const error = await screen.findByRole('alert')
  expect(error).toHaveTextContent(err.IMAGE_INVALID)
})

test('an error renders for the images field if an image cannot be read as data url', async () => {
  mockReadAsDataUrl.mockResolvedValue('error')

  render(<CreateAPost />)

  await screen.findByTestId('csrfToken')

  const nameInput = screen.getByRole('textbox', { name: /name/i })
  userEvent.type(nameInput, 'Modern table')

  const descriptionInput = screen.getByRole('textbox', {
    name: /description/i,
  })
  userEvent.type(descriptionInput, 'A magnificent modern table.')

  await selectEvent.select(screen.getByLabelText('Categories'), 'furniture')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })
  userEvent.type(priceInput, '40')

  const image = new File(['data'], 'img.jpeg', { type: 'image/jpeg' })
  const imagesInput = screen.getByLabelText(/images/i)
  userEvent.upload(imagesInput, image)

  const submitBtn = screen.getByRole('button', { name: /create/i })
  userEvent.click(submitBtn)

  const error = await screen.findByRole('alert')
  expect(error).toHaveTextContent('error')
})

test('an error renders if the server fails to create the post', async () => {
  const setToast = jest.fn()
  useToast.mockReturnValue({ setToast })

  server.use(
    rest.post('http://localhost:3000/api/post', (req, res, ctx) => {
      return res(ctx.status(403), ctx.json({ message: err.FORBIDDEN }))
    })
  )

  render(<CreateAPost />)

  await screen.findByTestId('csrfToken')

  const nameInput = screen.getByRole('textbox', { name: /name/i })
  userEvent.type(nameInput, 'Modern table')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })
  userEvent.type(descriptionInput, 'A magnificent modern table.')

  await selectEvent.select(screen.getByLabelText('Categories'), 'furniture')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })
  userEvent.type(priceInput, '40')

  const imagesInput = screen.getByLabelText(/images/i)
  userEvent.upload(imagesInput, files)

  const submitBtn = screen.getByRole('button', { name: /create/i })
  userEvent.click(submitBtn)

  await waitFor(() => {
    const toast = { message: err.FORBIDDEN, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test('an error renders if the server fails to validate the request data', async () => {
  server.use(
    rest.post('http://localhost:3000/api/post', (req, res, ctx) => {
      return res(
        ctx.status(422),
        ctx.json({ name: 'name', message: err.NAME_MAX })
      )
    })
  )

  render(<CreateAPost />)

  await screen.findByTestId('csrfToken')

  const nameInput = screen.getByRole('textbox', { name: /name/i })
  userEvent.type(nameInput, 'Modern table')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })
  userEvent.type(descriptionInput, 'A magnificent modern table.')

  await selectEvent.select(screen.getByLabelText('Categories'), 'furniture')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })
  userEvent.type(priceInput, '40')

  const imagesInput = screen.getByLabelText(/images/i)
  userEvent.upload(imagesInput, files)

  const submitBtn = screen.getByRole('button', { name: /create/i })
  userEvent.click(submitBtn)

  const error = await screen.findByRole('alert')
  expect(error).toHaveTextContent(err.NAME_MAX)
})
