import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import server from '../../../../../mocks/server'
import UpdatePost from '../../../../../pages/posts/[id]/[name]/update'
import err from '../../../../../utils/constants/errors'

const axiosPut = jest.spyOn(require('axios'), 'put')
const useToast = jest.spyOn(
  require('../../../../../contexts/toast'),
  'useToast'
)

const setToast = jest.fn()
const data = { url: 'presigned url', key: 'keyName' }
const csrfToken = 'token'
const awsUrl = process.env.NEXT_PUBLIC_AWS_URL + '/'

beforeEach(() => {
  useToast.mockReturnValue({ setToast })
  axiosPut.mockResolvedValue({})
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const post = {
  id: '0',
  name: 'Table',
  description: 'Magnificent table',
  categories: ['furniture' as const],
  price: 5000,
  images: ['keyName'],
  address: 'Oslo, Norway',
  latLon: [17, 22] as [number, number],
  userId: '1',
  discussionsIds: [],
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
  expect(image).toHaveAttribute('src', awsUrl + post.images[0])

  const addressBtn = screen.getByRole('button', { name: /address/i })
  await userEvent.click(addressBtn)

  const address = screen.getByText(post.address)
  expect(address).toBeInTheDocument()
})

test('an alert renders if the post is updated', async () => {
  axiosPut
    .mockResolvedValue({})
    .mockResolvedValueOnce({ data })
    .mockResolvedValueOnce({})
    .mockResolvedValueOnce({ data })
    .mockResolvedValueOnce({})

  render(<UpdatePost post={post} csrfToken={csrfToken} />)

  const nameBtn = screen.getByRole('button', { name: /name/i })
  await userEvent.click(nameBtn)

  const inputName = screen.getByRole('textbox', { name: /name/i })
  await userEvent.type(inputName, 'Garden gnome')

  const imagesBtn = screen.getByRole('button', { name: /images/i })
  await userEvent.click(imagesBtn)

  const images = [
    new File(['data'], 'img1.jpg', { type: 'image/jpeg' }),
    new File(['data'], 'img2.jpg', { type: 'image/jpeg' }),
  ]
  const imagesInput = screen.getByLabelText(/new images/i)
  await userEvent.upload(imagesInput, images)

  const submitBtn = screen.getByRole('button', { name: /update/i })
  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(setToast).toHaveBeenCalledTimes(1)

    const calls = axiosPut.mock.calls

    expect(calls[0][1]).toEqual({ csrfToken })

    expect(calls[1][0]).toBe(data.url)
    expect(calls[1][1]).toBe(images[0])

    expect(calls[3][1]).toBe(images[1])

    expect(calls[4][0]).toBe('/api/posts/0')
    expect(calls[4][1]).toEqual({
      csrfToken,
      name: 'Garden gnome',
      images: [data.key, data.key],
    })
  })
})

test('an error renders if the server fails to fetch the presigned url', async () => {
  axiosPut.mockRejectedValue({ response: { data: { message: 'error' } } })

  render(<UpdatePost post={post} csrfToken={csrfToken} />)

  const imagesBtn = screen.getByRole('button', { name: /images/i })
  await userEvent.click(imagesBtn)

  const image = new File(['data'], 'img.jpg', { type: 'image/jpeg' })
  const imagesInput = screen.getByLabelText(/new images/i)
  await userEvent.upload(imagesInput, image)

  const submitBtn = screen.getByRole('button', { name: /update/i })
  await userEvent.click(submitBtn)

  await waitFor(() => {
    const toast = { message: 'error', error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test('an error renders if the request to the presigned url fails', async () => {
  axiosPut
    .mockRejectedValue({ response: { data: { message: 'error' } } })
    .mockResolvedValueOnce({ data })

  render(<UpdatePost post={post} csrfToken={csrfToken} />)

  const imagesBtn = screen.getByRole('button', { name: /images/i })
  await userEvent.click(imagesBtn)

  const image = new File(['data'], 'img.jpg', { type: 'image/jpeg' })
  const imagesInput = screen.getByLabelText(/new images/i)
  await userEvent.upload(imagesInput, image)

  const submitBtn = screen.getByRole('button', { name: /update/i })
  await userEvent.click(submitBtn)

  await waitFor(() => {
    const toast = { message: 'error', error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test('an error renders if the server fails to update the post', async () => {
  axiosPut.mockRejectedValue({ response: { data: { message: 'error' } } })

  render(<UpdatePost post={post} csrfToken={csrfToken} />)

  const submitBtn = screen.getByRole('button', { name: /update/i })
  await userEvent.click(submitBtn)

  await waitFor(() => {
    const toast = { message: 'error', error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test("an error renders if the server fails to validate the request's data", async () => {
  axiosPut.mockRejectedValue({
    response: { data: { name: 'name', message: err.NAME_MAX } },
  })

  render(<UpdatePost post={post} csrfToken={csrfToken} />)

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
  render(<UpdatePost post={post} csrfToken={csrfToken} />)

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

test('an error renders if an image is too big', async () => {
  render(<UpdatePost post={post} csrfToken={csrfToken} />)

  const imagesBtn = screen.getByRole('button', { name: /images/i })
  await userEvent.click(imagesBtn)

  const data = new Uint8Array(1_000_001).toString()
  const image = new File([data], 'img.jpg', { type: 'image/jpeg' })
  const imagesInput = screen.getByLabelText(/new images/i)
  await userEvent.upload(imagesInput, image)

  const submitBtn = screen.getByRole('button', { name: /update/i })
  await userEvent.click(submitBtn)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(err.IMAGE_TOO_BIG)
})

test('the form send the latitude/longitude along the address when it is updated', async () => {
  render(<UpdatePost post={post} csrfToken={csrfToken} />)

  const addressBtn = screen.getByRole('button', { name: /address/i })
  await userEvent.click(addressBtn)

  const input = screen.getByRole('combobox', { name: /address/i })
  await userEvent.type(input, 'aa')

  await screen.findByRole('listbox')
  await userEvent.tab()

  const submitBtn = screen.getByRole('button', { name: /update/i })
  await userEvent.click(submitBtn)

  await waitFor(() => {
    const data = { csrfToken, address: 'Oslo, Norway', latLon: [59, 10] }
    expect(axiosPut).toHaveBeenNthCalledWith(1, '/api/posts/0', data)
  })

  axiosPut.mockRestore()
})
