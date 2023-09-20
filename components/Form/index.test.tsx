import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { BaseSyntheticEvent } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import Form from '.'

it('renders', async () => {
  const submitHandler = jest.fn()

  render(
    <Form
      name="register"
      method="post"
      methods={
        {
          handleSubmit: () => (e: BaseSyntheticEvent) => {
            e.preventDefault()
            submitHandler()
          },
          register: jest.fn(),
        } as unknown as UseFormReturn
      }
      submitHandler={submitHandler}
    >
      <input type="submit" />
    </Form>
  )

  const form = screen.getByRole('form')

  expect(form).toHaveAttribute('name', 'register')
  expect(form).toHaveAttribute('method', 'post')

  const submitBtn = screen.getByRole('button')

  expect(submitBtn).toBeInTheDocument()

  await userEvent.click(submitBtn)

  await waitFor(() => expect(submitHandler).toHaveBeenCalledTimes(1))
})
