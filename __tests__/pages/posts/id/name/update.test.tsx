import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UpdatePost from '../../../../../pages/posts/[id]/[name]/update'
import err from '../../../../../utils/constants/errors'

const axiosGet = jest.spyOn(require('axios'), 'get')
const axiosPut = jest.spyOn(require('axios'), 'put')
const axiosPost = jest.spyOn(require('axios'), 'post')
const useToast = jest.spyOn(
  require('../../../../../contexts/toast'),
  'useToast'
)

const setToast = jest.fn()
const data = { url: 'signed url', key: 'keyName', fields: {} }
const csrfToken = 'token'
const awsUrl = process.env.NEXT_PUBLIC_AWS_URL + '/'

beforeEach(() => {
  useToast.mockReturnValue({ setToast })
  axiosGet.mockResolvedValue({ data })
  axiosPut.mockResolvedValue({})
  axiosPost.mockResolvedValue({})
})

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
    const getCalls = axiosGet.mock.calls
    const getUrl = '/api/s3?csrfToken=' + csrfToken
    expect(getCalls[0][0]).toBe(getUrl)

    const postCalls = axiosPost.mock.calls
    expect(postCalls[0][0]).toBe(data.url)
    let formData = new FormData()
    formData.append('file', images[0])
    expect(postCalls[0][1]).toEqual(formData)

    expect(getCalls[1][0]).toBe(getUrl)

    expect(postCalls[1][0]).toBe(data.url)
    formData.set('file', images[1])
    expect(postCalls[1][1]).toEqual(formData)

    expect(axiosPut).toHaveBeenNthCalledWith(1, '/api/posts/0', {
      csrfToken,
      name: 'Garden gnome',
      images: [data.key, data.key],
    })
  })
})

test('an error renders if the server fails to fetch the presigned url', async () => {
  axiosGet.mockRejectedValue({ response: { data: { message: 'error' } } })

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

test('an error renders if the request to the presigned url fails because an image is too big', async () => {
  axiosPost.mockRejectedValue({ response: { status: 400, data: 'xml' } })

  render(<UpdatePost post={post} csrfToken={csrfToken} />)

  const imagesBtn = screen.getByRole('button', { name: /images/i })
  await userEvent.click(imagesBtn)

  const image = new File(['data'], 'img.jpg', { type: 'image/jpeg' })
  const imagesInput = screen.getByLabelText(/new images/i)
  await userEvent.upload(imagesInput, image)

  const submitBtn = screen.getByRole('button', { name: /update/i })
  await userEvent.click(submitBtn)

  await waitFor(() => {
    const toast = { message: err.IMAGE_TOO_BIG, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test('an error renders if the request to the presigned url fails', async () => {
  axiosPost.mockRejectedValue({ response: { status: 403, data: 'xml' } })

  render(<UpdatePost post={post} csrfToken={csrfToken} />)

  const imagesBtn = screen.getByRole('button', { name: /images/i })
  await userEvent.click(imagesBtn)

  const image = new File(['data'], 'img.jpg', { type: 'image/jpeg' })
  const imagesInput = screen.getByLabelText(/new images/i)
  await userEvent.upload(imagesInput, image)

  const submitBtn = screen.getByRole('button', { name: /update/i })
  await userEvent.click(submitBtn)

  await waitFor(() => {
    const toast = { message: err.DEFAULT, error: true }
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
  axiosGet.mockResolvedValue({
    data: [
      {
        lat: 59,
        lon: 10,
        type: 'city',
        display_place: 'Oslo',
        display_address: 'Norway',
        address: { name: 'Oslo', country: 'Norway' },
      },
    ],
  })

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
