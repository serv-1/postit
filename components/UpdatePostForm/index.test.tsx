import { render, screen } from '@testing-library/react'
import UpdatePostForm from '.'
import Toast from 'components/Toast'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
  NEXT_PUBLIC_CSRF_HEADER_NAME,
  NEXT_PUBLIC_LOCATION_IQ_URL,
} from 'env/public'
import type { Post } from 'types'

jest.mock('next-auth/react', () => ({
  getCsrfToken: () => 'token',
}))

const server = setupServer()

const post: Post = {
  _id: '0',
  name: 'table',
  description: 'magnificent table',
  price: 39.99,
  categories: ['furniture', 'decoration'],
  images: ['img1', 'img2'],
  address: 'Paris',
  latLon: [1, 2],
  userId: '1',
  discussionIds: [],
}

beforeEach(() => {
  window.scrollTo = () => undefined
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it("renders the actual post's name", async () => {
  render(<UpdatePostForm post={post} />)

  const nameBtn = screen.getByRole('button', { name: /name/i })

  await userEvent.click(nameBtn)

  const postName = screen.getByText(/^table$/i)

  expect(postName).toBeInTheDocument()
})

it("renders the actual post's description", async () => {
  render(<UpdatePostForm post={post} />)

  const descriptionBtn = screen.getByRole('button', { name: /description/i })

  await userEvent.click(descriptionBtn)

  const postDescription = screen.getByText(/^magnificent table$/i)

  expect(postDescription).toBeInTheDocument()
})

it("renders the actual post's categories", async () => {
  render(<UpdatePostForm post={post} />)

  const categoriesBtn = screen.getByRole('button', { name: /categories/i })

  await userEvent.click(categoriesBtn)

  const postCategories = screen.getByText(/^furniture, decoration$/i)

  expect(postCategories).toBeInTheDocument()
})

it("renders the actual post's price", async () => {
  render(<UpdatePostForm post={post} />)

  const priceBtn = screen.getByRole('button', { name: /price/i })

  await userEvent.click(priceBtn)

  const postPrice = screen.getByText(/^39,99/)

  expect(postPrice).toBeInTheDocument()
})

it("renders the actual post's images", async () => {
  render(<UpdatePostForm post={post} />)

  const imagesBtn = screen.getByRole('button', { name: /images/i })

  await userEvent.click(imagesBtn)

  const expandImageBtns = screen.getAllByRole('button', { name: /expand/i })

  expect(expandImageBtns).toHaveLength(2)

  const container = expandImageBtns[0].parentElement!

  expect(container.children.length).toBe(5)
})

it("renders the actual post's address", async () => {
  render(<UpdatePostForm post={post} />)

  const addressBtn = screen.getByRole('button', { name: /address/i })

  await userEvent.click(addressBtn)

  const postAddress = screen.getByText(/^Paris$/)

  expect(postAddress).toBeInTheDocument()
})

it('renders an error if the server fails to validate the data', async () => {
  server.use(
    http.put('http://localhost/api/posts/:id', () => {
      return HttpResponse.json(
        { name: 'name', message: 'error' },
        { status: 422 }
      )
    })
  )

  render(
    <>
      <Toast />
      <UpdatePostForm post={post} />
    </>
  )

  const nameBtn = screen.getByRole('button', { name: /name/i })

  await userEvent.click(nameBtn)

  const updateBtn = screen.getByRole('button', { name: /update/i })

  await userEvent.click(updateBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('error')
})

it('renders an error if the server fails to update the post', async () => {
  server.use(
    http.put('http://localhost/api/posts/:id', () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  render(
    <>
      <Toast />
      <UpdatePostForm post={post} />
    </>
  )

  const updateBtn = screen.getByRole('button', { name: /update/i })

  await userEvent.click(updateBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('error')
})

it('renders a message if the post has been updated', async () => {
  server.use(
    http.put('http://localhost/api/posts/:id', async ({ request, params }) => {
      expect(params.id).toBe('0')
      expect(request.headers.get(NEXT_PUBLIC_CSRF_HEADER_NAME)).toBe('token')
      expect(await request.json()).toEqual({ name: 'wooden table' })

      return new HttpResponse(null, { status: 204 })
    })
  )

  render(
    <>
      <Toast />
      <UpdatePostForm post={post} />
    </>
  )

  const nameBtn = screen.getByRole('button', { name: /name/i })

  await userEvent.click(nameBtn)

  const nameInput = screen.getByRole('textbox', { name: /name/i })

  await userEvent.type(nameInput, 'wooden table')

  const updateBtn = screen.getByRole('button', { name: /update/i })

  await userEvent.click(updateBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('The post has been updated! 🎉')
})

it('renders an error if the upload of an image fails', async () => {
  server.use(
    http.get('http://localhost/api/s3', () => {
      return HttpResponse.json({ message: 'error' }, { status: 500 })
    })
  )

  render(
    <>
      <Toast />
      <UpdatePostForm post={post} />
    </>
  )

  const imagesBtn = screen.getByRole('button', { name: /images/i })

  await userEvent.click(imagesBtn)

  const imagesInput = screen.getByLabelText(/new images/i)

  await userEvent.upload(
    imagesInput,
    new File([], 'i.png', { type: 'image/png' })
  )

  const updateBtn = screen.getByRole('button', { name: /update/i })

  await userEvent.click(updateBtn)

  const toast = screen.getByRole('alert')

  expect(toast).toHaveTextContent('error')
})

it("sends the post's latitude and longitude with the post's address", async () => {
  server.use(
    http.get(NEXT_PUBLIC_LOCATION_IQ_URL + '/autocomplete', () => {
      return HttpResponse.json(
        [
          {
            place_id: '0',
            lat: 1,
            lon: 2,
            display_address: 'France',
            display_place: 'Paris',
          },
        ],
        { status: 200 }
      )
    }),
    http.put('http://localhost/api/posts/:id', async ({ request }) => {
      expect(await request.json()).toEqual({
        address: 'Paris, France',
        latLon: [1, 2],
      })

      return new HttpResponse(null, { status: 204 })
    })
  )

  render(<UpdatePostForm post={post} />)

  const addressBtn = screen.getByRole('button', { name: /address/i })

  await userEvent.click(addressBtn)

  const addressInput = screen.getByRole('combobox')

  await userEvent.type(addressInput, 'a')
  await userEvent.tab()

  const updateBtn = screen.getByRole('button', { name: /update/i })

  await userEvent.click(updateBtn)
})

it('gives the focus to the input with an error', async () => {
  server.use(
    http.put('http://localhost/api/posts/:id', async () => {
      return HttpResponse.json(
        { name: 'name', message: 'error' },
        { status: 422 }
      )
    })
  )

  render(<UpdatePostForm post={post} />)

  const nameBtn = screen.getByRole('button', { name: /name/i })

  await userEvent.click(nameBtn)

  const updateBtn = screen.getByRole('button', { name: /update/i })

  await userEvent.click(updateBtn)

  const nameInput = screen.getByRole('textbox', { name: /name/i })

  expect(nameInput).toHaveFocus()
})
