import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateAPost from '../../pages/create-a-post'
import selectEvent from 'react-select-event'
import err from '../../utils/constants/errors'
import server from '../../mocks/server'
import { rest } from 'msw'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const useRouter = jest.spyOn(require('next/router'), 'useRouter')
const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')

const router = { push: jest.fn() }

beforeEach(() => {
  useRouter.mockReturnValue(router)
  useToast.mockReturnValue({})
})

it('renders', async () => {
  render(<CreateAPost />)

  await screen.findByTestId('csrfToken')

  let title = screen.getByRole('heading', { level: 1 })
  expect(title).toHaveTextContent(/where/i)

  const step0 = screen.getByTestId('step0')
  expect(step0).not.toHaveClass('hidden')

  const step1 = screen.getByTestId('step1')
  expect(step1).toHaveClass('hidden')

  const step2 = screen.getByTestId('step2')
  expect(step2).toHaveClass('hidden')

  const nextBtns = screen.getAllByRole('button', { name: /next/i })
  await userEvent.click(nextBtns[0])

  expect(title).toHaveTextContent(/show/i)
  expect(step0).toHaveClass('hidden')
  expect(step1).not.toHaveClass('hidden')
  expect(step2).toHaveClass('hidden')

  const fileInput = screen.getByLabelText(/images/i)
  const files = [new File(['1'], '1.jpeg', { type: 'image/jpeg' })]
  await userEvent.upload(fileInput, files)

  await userEvent.click(nextBtns[1])

  expect(title).toHaveTextContent(/post/i)
  expect(step0).toHaveClass('hidden')
  expect(step1).toHaveClass('hidden')
  expect(step2).not.toHaveClass('hidden')
})

test('the user is redirected to its profile after a valid submission', async () => {
  render(<CreateAPost />)

  await screen.findByTestId('csrfToken')

  const nextBtns = screen.getAllByRole('button', { name: /next/i })
  await userEvent.click(nextBtns[0])

  const imagesInput = screen.getByLabelText(/images/i)
  const image = new File(['data'], 'img.jpeg', { type: 'image/jpeg' })
  await userEvent.upload(imagesInput, image)

  await userEvent.click(nextBtns[1])

  const nameInput = screen.getByRole('textbox', { name: /name/i })
  await userEvent.type(nameInput, 'Modern table')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })
  await userEvent.type(priceInput, '40')

  await selectEvent.select(screen.getByLabelText('Categories'), 'furniture')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })
  await userEvent.type(descriptionInput, 'A magnificent modern table.')

  const submitBtn = screen.getByRole('button', { name: /post/i })
  await userEvent.click(submitBtn)

  await waitFor(() => {
    expect(router.push).toHaveBeenNthCalledWith(1, '/profile')
  })
})

test('an error renders if the server fails to create the post', async () => {
  const setToast = jest.fn()
  useToast.mockReturnValue({ setToast })

  server.use(
    rest.post('http://localhost:3000/api/post', (req, res, ctx) => {
      return res(ctx.status(403), ctx.json({ message: err.FORBIDDEN }))
    })
  )

  render(<CreateAPost />)

  await screen.findByTestId('csrfToken')

  const nextBtns = screen.getAllByRole('button', { name: /next/i })
  await userEvent.click(nextBtns[0])

  const imagesInput = screen.getByLabelText(/images/i)
  const image = new File(['data'], 'img.jpeg', { type: 'image/jpeg' })
  await userEvent.upload(imagesInput, image)

  await userEvent.click(nextBtns[1])

  const nameInput = screen.getByRole('textbox', { name: /name/i })
  await userEvent.type(nameInput, 'Modern table')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })
  await userEvent.type(priceInput, '40')

  await selectEvent.select(screen.getByLabelText('Categories'), 'furniture')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })
  await userEvent.type(descriptionInput, 'A magnificent modern table.')

  const submitBtn = screen.getByRole('button', { name: /post/i })
  await userEvent.click(submitBtn)

  await waitFor(() => {
    const toast = { message: err.FORBIDDEN, error: true }
    expect(setToast).toHaveBeenNthCalledWith(1, toast)
  })
})

test("an error renders if the server fails to validate the request's data", async () => {
  server.use(
    rest.post('http://localhost:3000/api/post', (req, res, ctx) => {
      return res(
        ctx.status(422),
        ctx.json({ name: 'name', message: err.NAME_MAX })
      )
    })
  )

  render(<CreateAPost />)

  await screen.findByTestId('csrfToken')

  const nextBtns = screen.getAllByRole('button', { name: /next/i })
  await userEvent.click(nextBtns[0])

  const imagesInput = screen.getByLabelText(/images/i)
  const image = new File(['data'], 'img.jpeg', { type: 'image/jpeg' })
  await userEvent.upload(imagesInput, image)

  await userEvent.click(nextBtns[1])

  const nameInput = screen.getByRole('textbox', { name: /name/i })
  await userEvent.type(nameInput, 'Modern table')

  const priceInput = screen.getByRole('spinbutton', { name: /price/i })
  await userEvent.type(priceInput, '40')

  await selectEvent.select(screen.getByLabelText('Categories'), 'furniture')

  const descriptionInput = screen.getByRole('textbox', { name: /description/i })
  await userEvent.type(descriptionInput, 'A magnificent modern table.')

  const submitBtn = screen.getByRole('button', { name: /post/i })
  await userEvent.click(submitBtn)

  const error = await screen.findByRole('alert')
  expect(error).toHaveTextContent(err.NAME_MAX)
})
