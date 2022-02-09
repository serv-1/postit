import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BaseSyntheticEvent } from 'react'
import { SubmitHandler, UseFormReturn } from 'react-hook-form'
import Form from '../../components/Form'
import server from '../../mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const submitHandler = jest.fn()

const submitHandlers = {
  submitHandler: (e: BaseSyntheticEvent) => {
    e.preventDefault()
    submitHandler()
  },
} as unknown as { submitHandler: SubmitHandler<{}> }

const methods = {
  handleSubmit: (fn: () => void) => fn,
  register: (name: string) => ({ name }),
} as unknown as UseFormReturn

const factory = (needCsrfToken?: boolean) => {
  render(
    <Form
      name="register"
      method="post"
      submitHandlers={submitHandlers}
      methods={methods}
      needCsrfToken={needCsrfToken}
    >
      <input type="submit" />
    </Form>
  )
}

test('the form renders', async () => {
  factory(true)

  const form = screen.getByRole('form')
  expect(form).toHaveAttribute('name', 'register')
  expect(form).toHaveAttribute('method', 'post')

  const submitBtn = screen.getByRole('button')
  expect(submitBtn).toBeInTheDocument()

  userEvent.click(submitBtn)
  expect(submitHandler).toHaveBeenCalledTimes(1)

  const csrfToken = await screen.findByTestId('csrfToken')
  expect(csrfToken).toBeInTheDocument()
})

test('the csrfToken input does not renders', () => {
  factory()

  const csrfToken = screen.queryByTestId('csrfToken')
  expect(csrfToken).not.toBeInTheDocument()
})
