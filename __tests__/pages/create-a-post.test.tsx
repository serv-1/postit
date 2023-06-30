import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateAPost from '../../pages/create-a-post'
import selectEvent from 'react-select-event'
import err from '../../utils/constants/errors'
import { useToast } from '../../contexts/toast'

jest.mock('../../contexts/toast', () => ({
  useToast: jest.fn(),
}))

const useToastMock = useToast as jest.MockedFunction<typeof useToast>

const axiosGet = jest.spyOn(require('axios'), 'get')
const axiosPost = jest.spyOn(require('axios'), 'post')
const useRouter = jest.spyOn(require('next/router'), 'useRouter')

const router = { push: jest.fn() }
const setToast = jest.fn()
const csrfToken = 'token'
const data = { url: 'signed url', key: 'keyName', fields: {} }
const postRes = { headers: { location: '/posts/0/Table' } }
const locationIQRes = {
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
}

beforeEach(() => {
  axiosGet.mockResolvedValue({ data }).mockResolvedValueOnce(locationIQRes)
  axiosPost.mockResolvedValue(postRes)
  useRouter.mockReturnValue(router)
  useToastMock.mockReturnValue({ setToast, toast: {} })
})

test('renders the title related to the actually displayed step', async () => {
  render(<CreateAPost csrfToken={csrfToken} />)

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

test('the uploaded images and the latitude/longitude are sent with the request', async () => {
  axiosPost
    .mockResolvedValue(postRes)
    .mockResolvedValueOnce({})
    .mockResolvedValueOnce({})

  render(<CreateAPost csrfToken={csrfToken} />)

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

  await waitFor(() => {
    const getCalls = axiosGet.mock.calls
    const getUrl = '/api/s3?csrfToken=' + csrfToken
    expect(getCalls[1][0]).toBe(getUrl)

    const postCalls = axiosPost.mock.calls
    expect(postCalls[0][0]).toBe(data.url)
    let formData = new FormData()
    formData.append('file', images[0])
    expect(postCalls[0][1]).toEqual(formData)

    expect(getCalls[2][0]).toBe(getUrl)

    expect(postCalls[1][0]).toBe(data.url)
    formData.set('file', images[1])
    expect(postCalls[1][1]).toEqual(formData)

    expect(postCalls[2][0]).toBe('/api/post')
    expect(postCalls[2][1]).toEqual({
      csrfToken,
      name: 'Modern table',
      description: 'A magnificent modern table.',
      categories: ['furniture'],
      price: 40,
      images: [data.key, data.key],
      address: 'Oslo, Norway',
      latLon: [59, 10],
    })
  })
})

test('the user is redirected to the post page after a valid submission', async () => {
  render(<CreateAPost csrfToken={csrfToken} />)

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
    expect(router.push).toHaveBeenNthCalledWith(1, postRes.headers.location)
  })
})

test('an error renders if the server fails to fetch the presigned url', async () => {
  axiosGet
    .mockReset()
    .mockRejectedValue({ response: { data: { message: 'error' } } })
    .mockResolvedValueOnce(locationIQRes)

  render(<CreateAPost csrfToken={csrfToken} />)

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
    const toast = { message: 'error', error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test('an error renders if the request to the presigned url fails because an image is too big', async () => {
  axiosPost.mockRejectedValue({ response: { status: 400, data: 'xml' } })

  render(<CreateAPost csrfToken={csrfToken} />)

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
    const toast = { message: err.IMAGE_TOO_BIG, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test('an error renders if the request to the presigned url fails', async () => {
  axiosPost.mockRejectedValue({ response: { status: 403, data: 'xml' } })

  render(<CreateAPost csrfToken={csrfToken} />)

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
    const toast = { message: err.DEFAULT, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test('an error renders if the server fails to create the post', async () => {
  axiosPost
    .mockRejectedValue({ response: { data: { message: 'error' } } })
    .mockResolvedValueOnce({})

  render(<CreateAPost csrfToken={csrfToken} />)

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
    const toast = { message: 'error', error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test("an error renders if the server fails to validate the request's data", async () => {
  axiosPost
    .mockRejectedValue({
      response: { data: { message: err.NAME_MAX, name: 'name' } },
    })
    .mockResolvedValueOnce({})

  render(<CreateAPost csrfToken={csrfToken} />)

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
  expect(error).toHaveTextContent(err.NAME_MAX)
})
