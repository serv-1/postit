import { render, screen } from '@testing-library/react'
import InputError from '.'
import { FormProvider, useForm } from 'react-hook-form'
import userEvent from '@testing-library/user-event'

function TestForm() {
  const methods = useForm()

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(() => {})}>
        <input
          type="text"
          {...methods.register('name', { required: 'name required' })}
        />
        <InputError<{ name: string }> name="name" />
        <input type="submit" />
      </form>
    </FormProvider>
  )
}

it("doesn't render if there is no error", () => {
  render(<TestForm />)

  const alert = screen.queryByRole('alert')

  expect(alert).not.toBeInTheDocument()
})

it('renders if there is an error', async () => {
  render(<TestForm />)

  const submitBtn = screen.getByRole('button')

  await userEvent.click(submitBtn)

  const alert = screen.getByRole('alert')

  expect(alert).toHaveAttribute('id', 'nameFeedback')
  expect(alert).toHaveTextContent('name required')
})
