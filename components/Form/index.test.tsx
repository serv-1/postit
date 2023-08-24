import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BaseSyntheticEvent } from 'react'
import { UseFormReturn } from 'react-hook-form'
import Form from '.'

it('renders', async () => {
  const submitHandler = jest.fn()
  const methods = {
    handleSubmit: jest.fn(() => (e: BaseSyntheticEvent) => {
      e.preventDefault()
      submitHandler()
    }),
    register: jest.fn(),
  } as unknown as UseFormReturn<{ csrfToken: string }>

  render(
    <Form<{ csrfToken: string }>
      name="register"
      method="post"
      methods={methods}
      submitHandler={submitHandler}
      csrfToken="csrfToken"
    >
      <input type="submit" />
    </Form>
  )

  const form = screen.getByRole('form')
  expect(form).toHaveAttribute('name', 'register')
  expect(form).toHaveAttribute('method', 'post')

  const csrfTokenInput = form.children[0]
  expect(csrfTokenInput).toHaveValue('csrfToken')

  const submitBtn = screen.getByRole('button')
  expect(submitBtn).toBeInTheDocument()

  await userEvent.click(submitBtn)

  await waitFor(() => expect(submitHandler).toHaveBeenCalledTimes(1))
})

test("the csrfToken input doesn't render if we don't need it", () => {
  const methods = {
    handleSubmit: jest.fn(),
    register: jest.fn(),
  } as unknown as UseFormReturn

  render(
    <Form
      name="register"
      method="post"
      methods={methods}
      submitHandler={jest.fn()}
    ></Form>
  )

  const csrfTokenInput = screen.getByRole('form').children[0]
  expect(csrfTokenInput).toBeUndefined()
})
