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

test('the user is redirected to its profile after a valid submission', async () => {
  render(<CreateAPost />)

  await screen.findByTestId('csrfToken')

  const imagesInput = screen.getByLabelText(/images/i)
  const image = new File(['data'], 'img.jpeg', { type: 'image/jpeg' })
  await userEvent.upload(imagesInput, image)

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

  const imagesInput = screen.getByLabelText(/images/i)
  const image = new File(['data'], 'img.jpeg', { type: 'image/jpeg' })
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

  const imagesInput = screen.getByLabelText(/images/i)
  const image = new File(['data'], 'img.jpeg', { type: 'image/jpeg' })
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
