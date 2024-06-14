import { render, screen } from '@testing-library/react'
import UpdatePostForm from '.'
import ToastProvider from 'components/ToastProvider'
import Toast from 'components/Toast'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import 'cross-fetch/polyfill'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'
import { useEffect as mockUseEffect } from 'react'
import { useFormContext as mockUseFormContext } from 'react-hook-form'

jest
  .mock('next-auth/react', () => ({
    getCsrfToken: () => 'token',
  }))
  .mock('components/PostAddressModal', () => ({
    __esModule: true,
    default: ({
      setLatLon,
    }: {
      setLatLon: React.Dispatch<
        React.SetStateAction<[number, number] | undefined>
      >
    }) => {
      const { register } = mockUseFormContext()

      mockUseEffect(() => {
        setLatLon([1, 2])
      }, [])

      return (
        <>
          <label htmlFor="address">Address</label>
          <input type="text" id="address" {...register('address')} />
        </>
      )
    },
  }))

const server = setupServer()

function Test() {
  return (
    <ToastProvider>
      <Toast />
      <UpdatePostForm
        post={{
          id: '0',
          name: 'table',
          description: 'magnificent table',
          price: 39.99,
          categories: ['furniture', 'decoration'],
          images: ['img1', 'img2'],
          address: 'Paris',
          latLon: [1, 2],
          userId: '1',
          discussionIds: [],
        }}
      />
    </ToastProvider>
  )
}

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it("renders the actual post's name", async () => {
  render(<Test />)

  const nameBtn = screen.getByRole('button', { name: /name/i })

  await userEvent.click(nameBtn)

  const postName = screen.getByText(/^table$/i)

  expect(postName).toBeInTheDocument()
})

it("renders the actual post's description", async () => {
  render(<Test />)

  const descriptionBtn = screen.getByRole('button', { name: /description/i })

  await userEvent.click(descriptionBtn)

  const postDescription = screen.getByText(/^magnificent table$/i)

  expect(postDescription).toBeInTheDocument()
})

it("renders the actual post's categories", async () => {
  render(<Test />)

  const categoriesBtn = screen.getByRole('button', { name: /categories/i })

  await userEvent.click(categoriesBtn)

  const postCategories = screen.getByText(/^furniture, decoration$/i)

  expect(postCategories).toBeInTheDocument()
})

it("renders the actual post's price", async () => {
  render(<Test />)

  const priceBtn = screen.getByRole('button', { name: /price/i })

  await userEvent.click(priceBtn)

  const postPrice = screen.getByText(/^39,99/)

  expect(postPrice).toBeInTheDocument()
})

it("renders the actual post's images", async () => {
  render(<Test />)

  const imagesBtn = screen.getByRole('button', { name: /images/i })

  await userEvent.click(imagesBtn)

  const expandImageBtns = screen.getAllByRole('button', { name: /expand/i })

  expect(expandImageBtns).toHaveLength(2)

  const container = expandImageBtns[0].parentElement!

  expect(container.children.length).toBe(5)
})

it("renders the actual post's address", async () => {
  render(<Test />)

  const addressBtn = screen.getByRole('button', { name: /address/i })

  await userEvent.click(addressBtn)

  const postAddress = screen.getByText(/^Paris$/)

  expect(postAddress).toBeInTheDocument()
})

it('renders an error if the server fails to validate the data', async () => {
  server.use(
    rest.put('http://localhost/api/posts/:id', (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ name: 'name', message: 'error' }))
    })
  )

  render(<Test />)

  const nameBtn = screen.getByRole('button', { name: /name/i })

  await userEvent.click(nameBtn)

  const updateBtn = screen.getByRole('button', { name: /update/i })

  await userEvent.click(updateBtn)

  const error = await screen.findByText(/error/i)

  expect(error).toBeInTheDocument()
})

it('renders an error if the server fails to update the post', async () => {
  server.use(
    rest.put('http://localhost/api/posts/:id', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(<Test />)

  const updateBtn = screen.getByRole('button', { name: /update/i })

  await userEvent.click(updateBtn)

  const error = await screen.findByText(/error/i)

  expect(error).toBeInTheDocument()
})

it('renders a message if the post has been updated', async () => {
  server.use(
    rest.put('http://localhost/api/posts/:id', async (req, res, ctx) => {
      expect(req.params.id).toBe('0')
      expect(req.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(await req.json()).toEqual({ name: 'wooden table' })

      return res(ctx.status(204))
    })
  )

  render(<Test />)

  const nameBtn = screen.getByRole('button', { name: /name/i })

  await userEvent.click(nameBtn)

  const nameInput = screen.getByRole('textbox', { name: /name/i })

  await userEvent.type(nameInput, 'wooden table')

  const updateBtn = screen.getByRole('button', { name: /update/i })

  await userEvent.click(updateBtn)

  const message = await screen.findByText(/the post has been updated/i)

  expect(message).toBeInTheDocument()
})

it('renders an error if the upload of an image fails', async () => {
  server.use(
    rest.get('http://localhost/api/s3', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'error' }))
    })
  )

  render(<Test />)

  const imagesBtn = screen.getByRole('button', { name: /images/i })

  await userEvent.click(imagesBtn)

  const imagesInput = screen.getByLabelText(/new images/i)

  await userEvent.upload(
    imagesInput,
    new File([], 'i.png', { type: 'image/png' })
  )

  const updateBtn = screen.getByRole('button', { name: /update/i })

  await userEvent.click(updateBtn)

  const error = await screen.findByText(/error/i)

  expect(error).toBeInTheDocument()
})

it("sends the post's latitude and longitude with the post's address", async () => {
  server.use(
    rest.put('http://localhost/api/posts/:id', async (req, res, ctx) => {
      expect(await req.json()).toEqual({
        address: 'Paris',
        latLon: [1, 2],
      })

      return res(ctx.status(204))
    })
  )

  render(<Test />)

  const addressBtn = screen.getByRole('button', { name: /address/i })

  await userEvent.click(addressBtn)

  const addressInput = screen.getByRole('textbox', { name: /address/i })

  await userEvent.type(addressInput, 'Paris')

  const updateBtn = screen.getByRole('button', { name: /update/i })

  await userEvent.click(updateBtn)
})

it('gives the focus to the input with an error', async () => {
  server.use(
    rest.put('http://localhost/api/posts/:id', async (req, res, ctx) => {
      return res(ctx.status(422), ctx.json({ name: 'name', message: 'error' }))
    })
  )

  render(<Test />)

  const nameBtn = screen.getByRole('button', { name: /name/i })

  await userEvent.click(nameBtn)

  const updateBtn = screen.getByRole('button', { name: /update/i })

  await userEvent.click(updateBtn)

  const nameInput = screen.getByRole('textbox', { name: /name/i })

  expect(nameInput).toHaveFocus()
})
