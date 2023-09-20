import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateAPost from '.'
import selectEvent from 'react-select-event'
import err from 'utils/constants/errors'
import { setupServer } from 'msw/node'
import 'cross-fetch/polyfill'
import locationIQAutocompleteHandlers from 'app/api/locationIQ/autocomplete/mock'
import { rest } from 'msw'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import s3Handlers from 'app/api/s3/mock'

const mockGetCsrfToken = jest.spyOn(require('next-auth/react'), 'getCsrfToken')
const mockSetToast = jest.fn()
const mockPush = jest.fn()
const server = setupServer()

jest
  .mock('contexts/toast', () => ({
    useToast: () => ({ setToast: mockSetToast, toast: {} }),
  }))
  .mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
  }))
  .mock('components/Header', () => ({
    __esModule: true,
    default: () => <header></header>,
  }))

beforeEach(() => {
  mockGetCsrfToken.mockResolvedValue('token')
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders the title related to the actually displayed step', async () => {
  server.use(...locationIQAutocompleteHandlers)

  render(<CreateAPost />)

  const title = screen.getByRole('heading', { level: 1 })

  expect(title).toHaveTextContent(/where/i)

  const addressInput = screen.getByLabelText(/address/i)

  await userEvent.type(addressInput, 'aa')
  await screen.findByRole('listbox')
  await userEvent.tab()

  const nextBtns = screen.getAllByRole('button', { name: /next/i })

  await userEvent.click(nextBtns[0])

  expect(title).toHaveTextContent(/show/i)

  const imagesInput = screen.getByLabelText(/images/i)
  const image = new File(['data'], 'img.jpg', { type: 'image/jpeg' })

  await userEvent.upload(imagesInput, image)

  await waitFor(() => expect(nextBtns[1]).toBeEnabled())

  await userEvent.click(nextBtns[1])

  expect(title).toHaveTextContent(/post/i)
})

it('sends the uploaded images and the latitude/longitude to the server', async () => {
  server.use(
    ...locationIQAutocompleteHandlers,
    rest.get('http://localhost/api/s3', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')

      return res.once(
        ctx.status(200),
        ctx.json({
          url: 'http://presigned-url',
          key: 'key1',
          fields: { a: 'a', b: 'b', c: 'c' },
        })
      )
    }),
    rest.get('http://localhost/api/s3', (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')

      return res(
        ctx.status(200),
        ctx.json({
          url: 'http://presigned-url',
          key: 'key2',
          fields: { a: 'a', b: 'b', c: 'c' },
        })
      )
    }),
    rest.post('http://presigned-url', (req, res, ctx) => {
      return res(ctx.status(201))
    }),
    rest.post('http://localhost/api/post', async (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(await req.json()).toEqual({
        name: 'Modern table',
        description: 'A magnificent modern table.',
        categories: ['furniture'],
        price: 40,
        images: ['key1', 'key2'],
        address: 'Oslo, Norway',
        latLon: [59, 10],
      })

      return res(ctx.status(200), ctx.json({ id: '0' }))
    })
  )

  render(<CreateAPost />)

  const addressInput = screen.getByRole('combobox', { name: /address/i })

  await userEvent.type(addressInput, 'aa')
  await screen.findByRole('listbox')
  await userEvent.tab()

  const imagesInput = screen.getByLabelText(/images/i)
  const images = [
    new File(['data'], 'img1.jpg', { type: 'image/jpeg' }),
    new File(['data'], 'img2.jpg', { type: 'image/jpeg' }),
  ]

  await userEvent.upload(imagesInput, images)

  const nameInput = screen.getByRole('textbox', { name: /name/i })

  await userEvent.type(nameInput, 'Modern table')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })

  await userEvent.type(priceInput, '40')

  const categoriesSelect = screen.getByLabelText('Categories')

  await selectEvent.select(categoriesSelect, 'furniture')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })

  await userEvent.type(descriptionInput, 'A magnificent modern table.')

  const submitBtn = screen.getByRole('button', { name: /post/i })

  await userEvent.click(submitBtn)
})

it('redirects the user to the post page after a valid submission', async () => {
  server.use(
    ...locationIQAutocompleteHandlers,
    ...s3Handlers,
    rest.post('http://localhost/api/post', async (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(await req.json()).toEqual({
        name: 'Modern table',
        description: 'A magnificent modern table.',
        categories: ['furniture'],
        price: 40,
        images: ['key'],
        address: 'Oslo, Norway',
        latLon: [59, 10],
      })

      return res(
        ctx.status(200),
        ctx.json({ id: '0' }),
        ctx.set('location', '/posts/0')
      )
    })
  )

  render(<CreateAPost />)

  const addressInput = screen.getByLabelText(/address/i)

  await userEvent.type(addressInput, 'aa')
  await screen.findByRole('listbox')
  await userEvent.tab()

  const imagesInput = screen.getByLabelText(/images/i)
  const image = new File(['data'], 'img.jpg', { type: 'image/jpeg' })

  await userEvent.upload(imagesInput, image)

  const nameInput = screen.getByRole('textbox', { name: /name/i })

  await userEvent.type(nameInput, 'Modern table')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })

  await userEvent.type(priceInput, '40')

  const categoriesSelect = screen.getByLabelText(/categories/i)

  await selectEvent.select(categoriesSelect, 'furniture')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })

  await userEvent.type(descriptionInput, 'A magnificent modern table.')

  const submitBtn = screen.getByRole('button', { name: /post/i })

  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(mockPush).toHaveBeenNthCalledWith(1, '/posts/0')
  })
})

it('renders an error if the server fails to fetch the presigned url', async () => {
  server.use(
    ...locationIQAutocompleteHandlers,
    rest.get('http://localhost/api/s3', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(<CreateAPost />)

  const addressInput = screen.getByLabelText(/address/i)

  await userEvent.type(addressInput, 'aa')
  await screen.findByRole('listbox')
  await userEvent.tab()

  const imagesInput = screen.getByLabelText(/images/i)
  const image = new File(['data'], 'img.jpg', { type: 'image/jpeg' })

  await userEvent.upload(imagesInput, image)

  const nameInput = screen.getByRole('textbox', { name: /name/i })

  await userEvent.type(nameInput, 'Modern table')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })

  await userEvent.type(priceInput, '40')

  const categoriesSelect = screen.getByLabelText(/categories/i)

  await selectEvent.select(categoriesSelect, 'furniture')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })

  await userEvent.type(descriptionInput, 'A magnificent modern table.')

  const submitBtn = screen.getByRole('button', { name: /post/i })

  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: 'error',
      error: true,
    })
  })
})

it('renders an error if the request to the presigned url fails because an image is too big', async () => {
  server.use(
    ...locationIQAutocompleteHandlers,
    rest.get('http://localhost/api/s3', (req, res, ctx) => {
      return res.once(
        ctx.status(200),
        ctx.json({
          url: 'http://presigned-url',
          key: 'key',
          fields: { a: 'a', b: 'b', c: 'c' },
        })
      )
    }),
    rest.post('http://presigned-url', (req, res, ctx) => {
      return res(ctx.status(400))
    })
  )

  render(<CreateAPost />)

  const addressInput = screen.getByLabelText(/address/i)

  await userEvent.type(addressInput, 'aa')
  await screen.findByRole('listbox')
  await userEvent.tab()

  const imagesInput = screen.getByLabelText(/images/i)
  const image = new File(['data'], 'img.jpg', { type: 'image/jpeg' })

  await userEvent.upload(imagesInput, image)

  const nameInput = screen.getByRole('textbox', { name: /name/i })

  await userEvent.type(nameInput, 'Modern table')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })

  await userEvent.type(priceInput, '40')

  const categoriesSelect = screen.getByLabelText(/categories/i)

  await selectEvent.select(categoriesSelect, 'furniture')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })

  await userEvent.type(descriptionInput, 'A magnificent modern table.')

  const submitBtn = screen.getByRole('button', { name: /post/i })

  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: err.IMAGE_TOO_BIG,
      error: true,
    })
  })
})

it('renders an error if the request to the presigned url fails', async () => {
  server.use(
    ...locationIQAutocompleteHandlers,
    rest.get('http://localhost/api/s3', (req, res, ctx) => {
      return res.once(
        ctx.status(200),
        ctx.json({
          url: 'http://presigned-url',
          key: 'key',
          fields: { a: 'a', b: 'b', c: 'c' },
        })
      )
    }),
    rest.post('http://presigned-url', (req, res, ctx) => {
      return res(ctx.status(500))
    })
  )

  render(<CreateAPost />)

  const addressInput = screen.getByLabelText(/address/i)

  await userEvent.type(addressInput, 'aa')
  await screen.findByRole('listbox')
  await userEvent.tab()

  const imagesInput = screen.getByLabelText(/images/i)
  const image = new File(['data'], 'img.jpg', { type: 'image/jpeg' })

  await userEvent.upload(imagesInput, image)

  const nameInput = screen.getByRole('textbox', { name: /name/i })

  await userEvent.type(nameInput, 'Modern table')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })

  await userEvent.type(priceInput, '40')

  const categoriesSelect = screen.getByLabelText(/categories/i)

  await selectEvent.select(categoriesSelect, 'furniture')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })

  await userEvent.type(descriptionInput, 'A magnificent modern table.')

  const submitBtn = screen.getByRole('button', { name: /post/i })

  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: err.DEFAULT,
      error: true,
    })
  })
})

it('renders an error if the server fails to create the post', async () => {
  server.use(
    ...locationIQAutocompleteHandlers,
    ...s3Handlers,
    rest.post('http://localhost/api/post', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(<CreateAPost />)

  const addressInput = screen.getByLabelText(/address/i)

  await userEvent.type(addressInput, 'aa')
  await screen.findByRole('listbox')
  await userEvent.tab()

  const imagesInput = screen.getByLabelText(/images/i)
  const image = new File(['data'], 'img.jpg', { type: 'image/jpeg' })

  await userEvent.upload(imagesInput, image)

  const nameInput = screen.getByRole('textbox', { name: /name/i })

  await userEvent.type(nameInput, 'Modern table')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })

  await userEvent.type(priceInput, '40')

  const categoriesSelect = screen.getByLabelText('Categories')

  await selectEvent.select(categoriesSelect, 'furniture')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })

  await userEvent.type(descriptionInput, 'A magnificent modern table.')

  const submitBtn = screen.getByRole('button', { name: /post/i })

  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: 'error',
      error: true,
    })
  })
})

it("renders an error if the server fails to validate the request's data", async () => {
  server.use(
    ...locationIQAutocompleteHandlers,
    ...s3Handlers,
    rest.post('http://localhost/api/post', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ name: 'name', message: 'error' }))
    })
  )

  render(<CreateAPost />)

  const addressInput = screen.getByLabelText(/address/i)

  await userEvent.type(addressInput, 'aa')
  await screen.findByRole('listbox')
  await userEvent.tab()

  const imagesInput = screen.getByLabelText(/images/i)
  const image = new File(['data'], 'img.jpg', { type: 'image/jpeg' })

  await userEvent.upload(imagesInput, image)

  const nameInput = screen.getByRole('textbox', { name: /name/i })

  await userEvent.type(nameInput, 'Modern table')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })

  await userEvent.type(priceInput, '40')

  const categoriesSelect = screen.getByLabelText('Categories')

  await selectEvent.select(categoriesSelect, 'furniture')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })

  await userEvent.type(descriptionInput, 'A magnificent modern table.')

  const submitBtn = screen.getByRole('button', { name: /post/i })

  await userEvent.click(submitBtn)

  const error = await screen.findByRole('alert')

  expect(error).toHaveTextContent('error')
})
