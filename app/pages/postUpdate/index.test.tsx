import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UpdatePost from '.'
import { NEXT_PUBLIC_AWS_URL, NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import { setupServer } from 'msw/node'
import s3Handlers from 'app/api/s3/mock'
import locationIQAutocompleteHandlers from 'app/api/locationIQ/autocomplete/mock'
import { rest } from 'msw'
import 'cross-fetch/polyfill'
import { IMAGE_TOO_BIG, DEFAULT } from 'constants/errors'

const mockGetCsrfToken = jest.spyOn(require('next-auth/react'), 'getCsrfToken')
const mockSetToast = jest.fn()
const server = setupServer()

jest
  .mock('hooks/useToast', () => ({
    __esModule: true,
    default: () => ({ setToast: mockSetToast, toast: {} }),
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

it('renders', async () => {
  render(
    <UpdatePost
      post={{
        id: '0',
        name: 'table',
        description: 'magnificent table',
        categories: ['furniture'],
        price: 5000,
        images: ['key'],
        address: 'Oslo, Norway',
        latLon: [17, 22],
        userId: '1',
        discussionIds: [],
      }}
    />
  )

  const nameBtn = screen.getByRole('button', { name: /name/i })

  await userEvent.click(nameBtn)

  const actualName = screen.getByText('table')

  expect(actualName).toBeInTheDocument()

  const descriptionBtn = screen.getByRole('button', { name: /description/i })

  await userEvent.click(descriptionBtn)

  const actualDescription = screen.getByText('magnificent table')

  expect(actualDescription).toBeInTheDocument()

  const categoriesBtn = screen.getByRole('button', { name: /categories/i })

  await userEvent.click(categoriesBtn)

  const actualCategories = screen.getByText('furniture')

  expect(actualCategories).toBeInTheDocument()

  const priceBtn = screen.getByRole('button', { name: /price/i })

  await userEvent.click(priceBtn)

  const actualPrice = screen.getByText('5 000€')

  expect(actualPrice).toBeInTheDocument()

  const imagesBtn = screen.getByRole('button', { name: /images/i })

  await userEvent.click(imagesBtn)

  const image = screen.getByRole('img')

  expect(image).toHaveAttribute('src', NEXT_PUBLIC_AWS_URL + '/key')

  const addressBtn = screen.getByRole('button', { name: /address/i })

  await userEvent.click(addressBtn)

  const address = screen.getByText('Oslo, Norway')

  expect(address).toBeInTheDocument()
})

it('renders an alert if the post is updated', async () => {
  server.use(
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
    rest.put('http://localhost/api/posts/:id', async (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(req.params.id).toBe('0')
      expect(await req.json()).toEqual({
        name: 'blue table',
        images: ['key1', 'key2'],
      })

      return res(ctx.status(204))
    })
  )

  render(
    <UpdatePost
      post={{
        id: '0',
        name: 'table',
        description: 'magnificent table',
        categories: ['furniture'],
        price: 5000,
        images: ['key'],
        address: 'Oslo, Norway',
        latLon: [17, 22],
        userId: '1',
        discussionIds: [],
      }}
    />
  )

  const nameBtn = screen.getByRole('button', { name: /name/i })

  await userEvent.click(nameBtn)

  const inputName = screen.getByRole('textbox', { name: /name/i })

  await userEvent.type(inputName, 'blue table')

  const imagesBtn = screen.getByRole('button', { name: /images/i })

  await userEvent.click(imagesBtn)

  const imagesInput = screen.getByLabelText(/new images/i)
  const images = [
    new File(['data'], 'img1.jpg', { type: 'image/jpeg' }),
    new File(['data'], 'img2.jpg', { type: 'image/jpeg' }),
  ]

  await userEvent.upload(imagesInput, images)

  const submitBtn = screen.getByRole('button', { name: /update/i })

  await userEvent.click(submitBtn)
})

it('renders an error if the server fails to fetch the presigned url', async () => {
  server.use(
    rest.get('http://localhost/api/s3', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(
    <UpdatePost
      post={{
        id: '0',
        name: 'table',
        description: 'magnificent table',
        categories: ['furniture'],
        price: 5000,
        images: ['key'],
        address: 'Oslo, Norway',
        latLon: [17, 22],
        userId: '1',
        discussionIds: [],
      }}
    />
  )

  const imagesBtn = screen.getByRole('button', { name: /images/i })

  await userEvent.click(imagesBtn)

  const imagesInput = screen.getByLabelText(/new images/i)
  const image = new File(['data'], 'img.jpg', { type: 'image/jpeg' })

  await userEvent.upload(imagesInput, image)

  const submitBtn = screen.getByRole('button', { name: /update/i })

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
    rest.get('http://localhost/api/s3', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ url: 'http://presigned-url', key: 'key', fields: {} })
      )
    }),
    rest.post('http://presigned-url', (req, res, ctx) => {
      return res(ctx.status(400))
    })
  )

  render(
    <UpdatePost
      post={{
        id: '0',
        name: 'table',
        description: 'magnificent table',
        categories: ['furniture'],
        price: 5000,
        images: ['key'],
        address: 'Oslo, Norway',
        latLon: [17, 22],
        userId: '1',
        discussionIds: [],
      }}
    />
  )

  const imagesBtn = screen.getByRole('button', { name: /images/i })

  await userEvent.click(imagesBtn)

  const imagesInput = screen.getByLabelText(/new images/i)
  const image = new File(['data'], 'img.jpg', { type: 'image/jpeg' })

  await userEvent.upload(imagesInput, image)

  const submitBtn = screen.getByRole('button', { name: /update/i })

  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: IMAGE_TOO_BIG,
      error: true,
    })
  })
})

it('renders an error if the request to the presigned url fails', async () => {
  server.use(
    rest.get('http://localhost/api/s3', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ url: 'http://presigned-url', key: 'key', fields: {} })
      )
    }),
    rest.post('http://presigned-url', (req, res, ctx) => {
      return res(ctx.status(500))
    })
  )

  render(
    <UpdatePost
      post={{
        id: '0',
        name: 'table',
        description: 'magnificent table',
        categories: ['furniture'],
        price: 5000,
        images: ['key'],
        address: 'Oslo, Norway',
        latLon: [17, 22],
        userId: '1',
        discussionIds: [],
      }}
    />
  )

  const imagesBtn = screen.getByRole('button', { name: /images/i })

  await userEvent.click(imagesBtn)

  const imagesInput = screen.getByLabelText(/new images/i)
  const image = new File(['data'], 'img.jpg', { type: 'image/jpeg' })

  await userEvent.upload(imagesInput, image)

  const submitBtn = screen.getByRole('button', { name: /update/i })

  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(mockSetToast).toHaveBeenNthCalledWith(1, {
      message: DEFAULT,
      error: true,
    })
  })
})

it('renders an error if the server fails to update the post', async () => {
  server.use(
    ...s3Handlers,
    rest.put('http://localhost/api/posts/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(
    <UpdatePost
      post={{
        id: '0',
        name: 'table',
        description: 'magnificent table',
        categories: ['furniture'],
        price: 5000,
        images: ['key'],
        address: 'Oslo, Norway',
        latLon: [17, 22],
        userId: '1',
        discussionIds: [],
      }}
    />
  )

  const submitBtn = screen.getByRole('button', { name: /update/i })

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
    ...s3Handlers,
    rest.put('http://localhost/api/posts/:id', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ name: 'name', message: 'error' }))
    })
  )

  render(
    <UpdatePost
      post={{
        id: '0',
        name: 'table',
        description: 'magnificent table',
        categories: ['furniture'],
        price: 5000,
        images: ['key'],
        address: 'Oslo, Norway',
        latLon: [17, 22],
        userId: '1',
        discussionIds: [],
      }}
    />
  )

  const nameBtn = screen.getByRole('button', { name: /name/i })

  await userEvent.click(nameBtn)

  const nameInput = screen.getByRole('textbox')

  await userEvent.type(nameInput, 'Gnome Garden')

  const submitBtn = screen.getByRole('button', { name: /update/i })

  await userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')

  expect(alert).toHaveTextContent('error')
})

it('sends the latitude/longitude along the address when it is updated', async () => {
  server.use(
    ...s3Handlers,
    ...locationIQAutocompleteHandlers,
    rest.put('http://localhost/api/posts/:id', async (req, res, ctx) => {
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(req.params.id).toBe('0')
      expect(await req.json()).toEqual({
        address: 'Oslo, Norway',
        latLon: [59, 10],
      })

      return res(ctx.status(204))
    })
  )

  render(
    <UpdatePost
      post={{
        id: '0',
        name: 'table',
        description: 'magnificent table',
        categories: ['furniture'],
        price: 5000,
        images: ['key'],
        address: 'Oslo, Norway',
        latLon: [17, 22],
        userId: '1',
        discussionIds: [],
      }}
    />
  )

  const addressBtn = screen.getByRole('button', { name: /address/i })

  await userEvent.click(addressBtn)

  const input = screen.getByRole('combobox', { name: /address/i })

  await userEvent.type(input, 'aa')
  await screen.findByRole('listbox')
  await userEvent.tab()

  const submitBtn = screen.getByRole('button', { name: /update/i })

  await userEvent.click(submitBtn)
})
