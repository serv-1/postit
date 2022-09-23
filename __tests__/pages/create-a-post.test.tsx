import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateAPost from '../../pages/create-a-post'
import selectEvent from 'react-select-event'
import server from '../../mocks/server'
import err from '../../utils/constants/errors'

const axiosPut = jest.spyOn(require('axios'), 'put')
const axiosPost = jest.spyOn(require('axios'), 'post')
const useRouter = jest.spyOn(require('next/router'), 'useRouter')
const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')

const router = { push: jest.fn() }
const setToast = jest.fn()
const data = { url: 'presigned url', key: 'keyName' }
const csrfToken = 'token'

beforeEach(() => {
  axiosPut.mockResolvedValue({}).mockResolvedValueOnce({ data })
  axiosPost.mockResolvedValue({})
  useRouter.mockReturnValue(router)
  useToast.mockReturnValue({ setToast })
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

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
  axiosPut.mockResolvedValueOnce({}).mockResolvedValueOnce({ data })

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
    expect(axiosPut.mock.calls[0][1]).toEqual({ csrfToken })
    expect(axiosPut.mock.calls[1][0]).toBe(data.url)
    expect(axiosPut.mock.calls[1][1]).toBe(images[0])
    expect(axiosPut.mock.calls[3][0]).toBe(data.url)
    expect(axiosPut.mock.calls[3][1]).toBe(images[1])

    expect(axiosPost).toHaveBeenNthCalledWith(1, '/api/post', {
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
  axiosPost.mockResolvedValue({ headers: { location: '/posts/0/Table' } })

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
    expect(router.push).toHaveBeenNthCalledWith(1, '/posts/0/Table')
  })
})

test('an error renders if the server fails to fetch the presigned url', async () => {
  axiosPut
    .mockReset()
    .mockResolvedValue({})
    .mockRejectedValueOnce({ response: { data: { message: 'error' } } })

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

test('an error renders if the request to the presigned url fails', async () => {
  axiosPut
    .mockReset()
    .mockRejectedValue({ response: { data: { message: 'error' } } })
    .mockResolvedValueOnce({ data })

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

test('an error renders if the server fails to create the post', async () => {
  axiosPost.mockRejectedValue({ response: { data: { message: err.DEFAULT } } })

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
    const toast = { message: err.DEFAULT, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test("an error renders if the server fails to validate the request's data", async () => {
  axiosPost.mockRejectedValue({
    response: { data: { message: err.NAME_MAX, name: 'name' } },
  })

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
