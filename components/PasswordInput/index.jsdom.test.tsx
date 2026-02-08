import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PasswordInput from '.'
import { FormProvider, useForm } from 'react-hook-form'

function TestForm({ children }: { children: React.ReactNode }) {
  const methods = useForm()

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(() => {})}>{children}</form>
    </FormProvider>
  )
}

it('uses the given id', () => {
  render(
    <TestForm>
      <label htmlFor="test">Password</label>
      <PasswordInput id="test" />
    </TestForm>
  )

  const input = screen.getByLabelText(/^password$/i)

  expect(input).toHaveAttribute('id', 'test')
})

it('uses the given class names', () => {
  render(
    <TestForm>
      <label htmlFor="password">Password</label>
      <PasswordInput className="blue-password" />
    </TestForm>
  )

  const container = screen.getByLabelText(/^password$/i).parentElement!

  expect(container).toHaveClass('blue-password')
})

it('takes the focus', () => {
  render(
    <TestForm>
      <label htmlFor="password">Password</label>
      <PasswordInput needFocus />
    </TestForm>
  )

  const input = screen.getByLabelText(/^password$/i)

  expect(input).toHaveFocus()
})

it("doesn't take the focus", () => {
  render(
    <TestForm>
      <label htmlFor="password">Password</label>
      <PasswordInput />
    </TestForm>
  )

  const input = screen.getByLabelText(/^password$/i)

  expect(input).not.toHaveFocus()
})

it('shows/hides the password', async () => {
  render(
    <TestForm>
      <label htmlFor="password">Password</label>
      <PasswordInput />
    </TestForm>
  )

  const input = screen.getByLabelText(/^password$/i)

  expect(input).toHaveAttribute('type', 'password')

  const showHideBtn = screen.getByRole('button')

  expect(showHideBtn).toHaveAccessibleName(/show/i)

  let eyeIcon = screen.getByTestId('eyeIcon')

  expect(eyeIcon).toBeInTheDocument()

  await userEvent.click(showHideBtn)

  expect(input).toHaveAttribute('type', 'text')
  expect(showHideBtn).toHaveAccessibleName(/hide/i)

  const eyeSlashIcon = screen.getByTestId('eyeSlashIcon')

  expect(eyeSlashIcon).toBeInTheDocument()

  await userEvent.click(showHideBtn)

  expect(input).toHaveAttribute('type', 'password')
  expect(showHideBtn).toHaveAccessibleName(/show/i)

  eyeIcon = screen.getByTestId('eyeIcon')

  expect(eyeIcon).toBeInTheDocument()
})

it('renders the password strength', async () => {
  render(
    <TestForm>
      <label htmlFor="password">Password</label>
      <PasswordInput showStrength />
    </TestForm>
  )

  const input = screen.getByLabelText(/^password$/i)

  expect(input).toHaveAccessibleDescription(/weak/i)

  await userEvent.type(input, 'walter bottle')

  expect(input).toHaveAccessibleDescription(/average/i)

  await userEvent.type(input, 'walter bottle triumph')

  expect(input).toHaveAccessibleDescription(/strong/i)
})

it("doesn't render the password strength", async () => {
  render(
    <TestForm>
      <label htmlFor="password">Password</label>
      <PasswordInput />
    </TestForm>
  )

  const input = screen.getByLabelText(/^password$/i)

  expect(input).not.toHaveAccessibleDescription()
})

it('takes into account the values of the other inputs when calculating the password strength', async () => {
  function TestForm() {
    const methods = useForm()

    return (
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(() => {})}>
          <label htmlFor="name">Name</label>
          <input type="text" id="name" {...methods.register('name')} />
          <label htmlFor="email">Email</label>
          <input type="email" id="email" {...methods.register('email')} />
          <label htmlFor="password">Password</label>
          <PasswordInput showStrength />
        </form>
      </FormProvider>
    )
  }

  render(<TestForm />)

  const nameInput = screen.getByRole('textbox', { name: /name/i })

  await userEvent.type(nameInput, 'walter bottle')

  const passwordInput = screen.getByLabelText(/^password$/i)

  await userEvent.type(passwordInput, 'walter bottle')

  expect(passwordInput).toHaveAccessibleDescription(/weak/i)

  const emailInput = screen.getByRole('textbox', { name: /email/i })

  await userEvent.type(emailInput, 'walter@bottle.com')

  await userEvent.type(passwordInput, 'walter@bottle.com')

  expect(passwordInput).toHaveAccessibleDescription(/weak/i)
})
