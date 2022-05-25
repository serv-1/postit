import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateAPost from '../../pages/create-a-post'
import selectEvent from 'react-select-event'

const axiosPost = jest.spyOn(require('axios'), 'post')
const useRouter = jest.spyOn(require('next/router'), 'useRouter')
const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')

const router = { push: jest.fn() }

beforeEach(() => {
  axiosPost.mockResolvedValue({})
  useRouter.mockReturnValue(router)
  useToast.mockReturnValue({})
})

test('renders the title related to the actually displayed step', async () => {
  render(<CreateAPost csrfToken="csrf" />)

  const title = screen.getByRole('heading', { level: 1 })
  expect(title).toHaveTextContent(/where/i)

  const nextBtns = screen.getAllByRole('button', { name: /next/i })

  await userEvent.click(nextBtns[0])
  expect(title).toHaveTextContent(/show/i)

  const imagesInput = screen.getByLabelText(/images/i)
  const image = new File(['data'], 'img.jpg', { type: 'image/jpeg' })
  await userEvent.upload(imagesInput, image)

  await userEvent.click(nextBtns[1])
  expect(title).toHaveTextContent(/post/i)
})

test('the uploaded images are sent with the request', async () => {
  render(<CreateAPost csrfToken="csrf" />)

  const imagesInput = screen.getByLabelText(/images/i)
  const image = new File(['data'], 'img.jpg', { type: 'image/jpeg' })
  await userEvent.upload(imagesInput, image)

  const nextBtns = screen.getAllByRole('button', { name: /next/i })
  await userEvent.click(nextBtns[1])

  const nameInput = screen.getByRole('textbox', { name: /name/i })
  await userEvent.type(nameInput, 'Modern table')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })
  await userEvent.type(priceInput, '40')

  const select = screen.getByLabelText('Categories')
  await selectEvent.select(select, 'furniture')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })
  await userEvent.type(descriptionInput, 'A magnificent modern table.')

  const submitBtn = screen.getByRole('button', { name: /post/i })
  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(axiosPost).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3000/api/post',
      {
        csrfToken: 'csrf',
        name: 'Modern table',
        description: 'A magnificent modern table.',
        categories: ['furniture'],
        price: 40,
        images: [{ base64: 'ZGF0YQ==', ext: 'jpg' }],
      }
    )
  })
})
