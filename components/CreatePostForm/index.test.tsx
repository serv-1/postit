import { render, screen } from '@testing-library/react'
import CreatePostForm from '.'
import 'cross-fetch/polyfill'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import userEvent from '@testing-library/user-event'
import { useFormContext } from 'react-hook-form'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import sendImage from 'functions/sendImage'
import selectEvent from 'react-select-event'

const mockSetToast = jest.fn()
const mockPush = jest.fn()
const mockSendImage = sendImage as jest.MockedFunction<typeof sendImage>
const server = setupServer()

jest
  .mock('hooks/useToast', () => ({
    __esModule: true,
    default: () => ({ setToast: mockSetToast, toast: {} }),
  }))
  .mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
  }))
  .mock('components/PostAddressModal', () => ({
    __esModule: true,
    default: function PostAddressModal({
      setLatLon,
    }: {
      setLatLon: React.Dispatch<
        React.SetStateAction<[number, number] | undefined>
      >
    }) {
      const { register } = useFormContext()

      return (
        <>
          <label htmlFor="address">Address</label>
          <input type="textbox" {...register('address')} id="address" />
          <button onClick={() => setLatLon([0, 0])}>latlon</button>
        </>
      )
    },
  }))
  .mock('functions/sendImage', () => ({
    __esModule: true,
    default: jest.fn(),
  }))
  .mock('next-auth/react', () => ({
    getCsrfToken: () => 'token',
  }))

beforeEach(() => {
  mockSendImage.mockImplementation(async (image: File) => image.name)
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it("disables the next button of the first step if the address isn't defined", async () => {
  render(<CreatePostForm />)

  const nextBtn = screen.getAllByRole('button', { name: /next/i })[0]

  expect(nextBtn).toBeDisabled()
})

it('enables the next button of the first step if the address is defined', async () => {
  render(<CreatePostForm />)

  const latlonBtn = screen.getByRole('button', { name: /latlon/i })

  await userEvent.click(latlonBtn)

  const nextBtn = screen.getAllByRole('button', { name: /next/i })[0]

  expect(nextBtn).toBeEnabled()
})

it('redirects to the page of the created post', async () => {
  server.use(
    rest.post('http://localhost/api/post', async (req, res, ctx) => {
      expect(await req.json()).toEqual({
        name: 'table',
        price: 20,
        description: 'magnificent table',
        categories: ['furniture'],
        images: ['1.jpeg'],
        latLon: [0, 0],
        address: 'paris',
      })

      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toEqual('token')

      return res(ctx.status(201), ctx.set('location', '/posts/0/table'))
    })
  )

  render(<CreatePostForm />)

  const latLonBtn = screen.getByRole('button', { name: /latlon/i })

  await userEvent.click(latLonBtn)

  const addressInput = screen.getByLabelText(/address/i)

  await userEvent.type(addressInput, 'paris')

  const imagesInput = screen.getByLabelText(/images/i)

  await userEvent.upload(
    imagesInput,
    new File(['1'], '1.jpeg', { type: 'image/jpeg' })
  )

  const nameInput = screen.getByLabelText(/name/i)

  await userEvent.type(nameInput, 'table')

  const priceInput = screen.getByLabelText(/price/i)

  await userEvent.type(priceInput, '20')

  const categoriesInput = screen.getByLabelText(/categories/i)

  await selectEvent.select(categoriesInput, ['furniture'])

  const descriptionInput = screen.getByLabelText(/description/i)

  await userEvent.type(descriptionInput, 'magnificent table')

  const submitBtn = screen.getByRole('button', { name: /post/i })

  await userEvent.click(submitBtn)

  expect(mockPush).toHaveBeenNthCalledWith(1, '/posts/0/table')
})

it('renders an error if the server fails to send the images', async () => {
  mockSendImage.mockRejectedValue(new Error('error'))

  render(<CreatePostForm />)

  const latLonBtn = screen.getByRole('button', { name: /latlon/i })

  await userEvent.click(latLonBtn)

  const addressInput = screen.getByLabelText(/address/i)

  await userEvent.type(addressInput, 'paris')

  const imagesInput = screen.getByLabelText(/images/i)

  await userEvent.upload(
    imagesInput,
    new File(['1'], '1.jpeg', { type: 'image/jpeg' })
  )

  const nameInput = screen.getByLabelText(/name/i)

  await userEvent.type(nameInput, 'table')

  const priceInput = screen.getByLabelText(/price/i)

  await userEvent.type(priceInput, '20')

  const categoriesInput = screen.getByLabelText(/categories/i)

  await selectEvent.select(categoriesInput, ['furniture'])

  const descriptionInput = screen.getByLabelText(/description/i)

  await userEvent.type(descriptionInput, 'magnificent table')

  const submitBtn = screen.getByRole('button', { name: /post/i })

  await userEvent.click(submitBtn)

  expect(mockSetToast).toHaveBeenNthCalledWith(1, {
    message: 'error',
    error: true,
  })
})

it('renders an error if the server fails to validate the data', async () => {
  server.use(
    rest.post('http://localhost/api/post', async (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ name: 'name', message: 'error' }))
    })
  )

  render(<CreatePostForm />)

  const latLonBtn = screen.getByRole('button', { name: /latlon/i })

  await userEvent.click(latLonBtn)

  const addressInput = screen.getByLabelText(/address/i)

  await userEvent.type(addressInput, 'paris')

  const imagesInput = screen.getByLabelText(/images/i)

  await userEvent.upload(
    imagesInput,
    new File(['1'], '1.jpeg', { type: 'image/jpeg' })
  )

  const nameInput = screen.getByLabelText(/name/i)

  await userEvent.type(nameInput, 'table')

  const priceInput = screen.getByLabelText(/price/i)

  await userEvent.type(priceInput, '20')

  const categoriesInput = screen.getByLabelText(/categories/i)

  await selectEvent.select(categoriesInput, ['furniture'])

  const descriptionInput = screen.getByLabelText(/description/i)

  await userEvent.type(descriptionInput, 'magnificent table')

  const submitBtn = screen.getByRole('button', { name: /post/i })

  await userEvent.click(submitBtn)

  const error = screen.getByRole('alert')

  expect(error).toHaveTextContent('error')
})

it('renders an error if the server fails to create the post', async () => {
  server.use(
    rest.post('http://localhost/api/post', async (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(<CreatePostForm />)

  const latLonBtn = screen.getByRole('button', { name: /latlon/i })

  await userEvent.click(latLonBtn)

  const addressInput = screen.getByLabelText(/address/i)

  await userEvent.type(addressInput, 'paris')

  const imagesInput = screen.getByLabelText(/images/i)

  await userEvent.upload(
    imagesInput,
    new File(['1'], '1.jpeg', { type: 'image/jpeg' })
  )

  const nameInput = screen.getByLabelText(/name/i)

  await userEvent.type(nameInput, 'table')

  const priceInput = screen.getByLabelText(/price/i)

  await userEvent.type(priceInput, '20')

  const categoriesInput = screen.getByLabelText(/categories/i)

  await selectEvent.select(categoriesInput, ['furniture'])

  const descriptionInput = screen.getByLabelText(/description/i)

  await userEvent.type(descriptionInput, 'magnificent table')

  const submitBtn = screen.getByRole('button', { name: /post/i })

  await userEvent.click(submitBtn)

  expect(mockSetToast).toHaveBeenNthCalledWith(1, {
    message: 'error',
    error: true,
  })
})

it('gives the focus to the input with the error', async () => {
  server.use(
    rest.post('http://localhost/api/post', async (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ name: 'name', message: 'error' }))
    })
  )

  render(<CreatePostForm />)

  const latLonBtn = screen.getByRole('button', { name: /latlon/i })

  await userEvent.click(latLonBtn)

  const addressInput = screen.getByLabelText(/address/i)

  await userEvent.type(addressInput, 'paris')

  const imagesInput = screen.getByLabelText(/images/i)

  await userEvent.upload(
    imagesInput,
    new File(['1'], '1.jpeg', { type: 'image/jpeg' })
  )

  const nameInput = screen.getByLabelText(/name/i)

  await userEvent.type(nameInput, 'table')

  const priceInput = screen.getByLabelText(/price/i)

  await userEvent.type(priceInput, '20')

  const categoriesInput = screen.getByLabelText(/categories/i)

  await selectEvent.select(categoriesInput, ['furniture'])

  const descriptionInput = screen.getByLabelText(/description/i)

  await userEvent.type(descriptionInput, 'magnificent table')

  const submitBtn = screen.getByRole('button', { name: /post/i })

  await userEvent.click(submitBtn)

  expect(nameInput).toHaveFocus()
})
