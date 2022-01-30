import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider } from '../../contexts/toast'
import CreateAPost from '../../pages/create-a-post'
import selectEvent from 'react-select-event'
import err from '../../utils/constants/errors'
import { mockResponse } from '../../lib/msw'
import Toast from '../../components/Toast'

const files: File[] = []

for (let i = 0; i < 3; i++) {
  const name = `image-${i}`
  files.push(new File([name], name + '.jpeg', { type: 'image/jpeg' }))
}

const useRouter = jest.spyOn(require('next/router'), 'useRouter')
const router = { push: jest.fn() }
useRouter.mockReturnValue(router)

const factory = () => {
  render(
    <ToastProvider>
      <CreateAPost />
      <Toast />
    </ToastProvider>
  )
}

test("the user is redirected to it's profile after a valid submission", async () => {
  factory()

  await screen.findByTestId('csrfToken')

  const nameInput = screen.getByRole('textbox', { name: /name/i })
  userEvent.type(nameInput, 'Modern table')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })
  userEvent.type(descriptionInput, 'A magnificent modern table.')

  await selectEvent.select(screen.getByLabelText('Categories'), 'furniture')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })
  userEvent.type(priceInput, '40')

  const imagesInput = screen.getByLabelText(/images/i)
  userEvent.upload(imagesInput, files)

  const submitBtn = screen.getByRole('button', { name: /create/i })
  userEvent.click(submitBtn)

  await waitFor(() => {
    expect(router.push).toHaveBeenCalledTimes(1)
    expect(router.push).toHaveBeenCalledWith('/profile')
  })
})

test('an error renders for the images field if an image is invalid', async () => {
  factory()

  await screen.findByTestId('csrfToken')

  const nameInput = screen.getByRole('textbox', { name: /name/i })
  userEvent.type(nameInput, 'Modern table')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })
  userEvent.type(descriptionInput, 'A magnificent modern table.')

  await selectEvent.select(screen.getByLabelText('Categories'), 'furniture')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })
  userEvent.type(priceInput, '40')

  const textFile = new File(['invalid'], 'invalid')
  const imagesInput = screen.getByLabelText(/images/i)
  userEvent.upload(imagesInput, textFile)

  const submitBtn = screen.getByRole('button', { name: /create/i })
  userEvent.click(submitBtn)

  const error = await screen.findByRole('alert')
  expect(error).toHaveTextContent(err.IMAGE_INVALID)
})

test('an error renders for the images field if an image is too large', async () => {
  factory()

  await screen.findByTestId('csrfToken')

  const nameInput = screen.getByRole('textbox', { name: /name/i })
  userEvent.type(nameInput, 'Modern table')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })
  userEvent.type(descriptionInput, 'A magnificent modern table.')

  await selectEvent.select(screen.getByLabelText('Categories'), 'furniture')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })
  userEvent.type(priceInput, '40')

  const data = new Uint8Array(1000001)
  const largeFile = new File([data], 'tooLarge.jpeg')
  const imagesInput = screen.getByLabelText(/images/i)
  userEvent.upload(imagesInput, largeFile)

  const submitBtn = screen.getByRole('button', { name: /create/i })
  userEvent.click(submitBtn)

  const error = await screen.findByRole('alert')
  expect(error).toHaveTextContent(err.IMAGE_INVALID)
})

test('an error renders if the server fails to create the post', async () => {
  mockResponse('post', '/api/post', 403, { message: err.FORBIDDEN })

  factory()

  await screen.findByTestId('csrfToken')

  const nameInput = screen.getByRole('textbox', { name: /name/i })
  userEvent.type(nameInput, 'Modern table')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })
  userEvent.type(descriptionInput, 'A magnificent modern table.')

  await selectEvent.select(screen.getByLabelText('Categories'), 'furniture')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })
  userEvent.type(priceInput, '40')

  const imagesInput = screen.getByLabelText(/images/i)
  userEvent.upload(imagesInput, files)

  const submitBtn = screen.getByRole('button', { name: /create/i })
  userEvent.click(submitBtn)

  const toast = await screen.findByRole('alert')
  expect(toast).toHaveTextContent(err.FORBIDDEN)
  expect(toast).toHaveClass('bg-danger')
})

test('an error renders if the server fails to validate the request data', async () => {
  mockResponse('post', '/api/post', 422, {
    name: 'name',
    message: err.NAME_MAX,
  })

  factory()

  await screen.findByTestId('csrfToken')

  const nameInput = screen.getByRole('textbox', { name: /name/i })
  userEvent.type(nameInput, 'Modern table')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })
  userEvent.type(descriptionInput, 'A magnificent modern table.')

  await selectEvent.select(screen.getByLabelText('Categories'), 'furniture')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })
  userEvent.type(priceInput, '40')

  const imagesInput = screen.getByLabelText(/images/i)
  userEvent.upload(imagesInput, files)

  const submitBtn = screen.getByRole('button', { name: /create/i })
  userEvent.click(submitBtn)

  const error = await screen.findByRole('alert')
  expect(error).toHaveTextContent(err.NAME_MAX)
})
