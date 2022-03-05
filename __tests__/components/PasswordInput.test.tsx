import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterOptions } from 'react-hook-form'
import Label from '../../components/Label'
import PasswordInput from '../../components/PasswordInput'

const useFormContext = jest.spyOn(require('react-hook-form'), 'useFormContext')

const setFormContext = (isSubmitted: boolean = false, error?: string) => ({
  register: jest.fn((name: string, opt: RegisterOptions) => ({
    onChange: opt.onChange,
  })),
  setFocus: jest.fn(),
  getValues: () => ({ name: 'John Doe', password: 'my password' }),
  formState: { isSubmitted, errors: error ? { password: error } : {} },
})

test('the input render and is hidden by default', () => {
  useFormContext.mockReturnValue(setFormContext())

  render(
    <>
      <Label htmlFor="password" labelText="Password" />
      <PasswordInput />
    </>
  )

  const container = screen.getByTestId('container')
  expect(container).toHaveClass('border-indigo-600')

  const btn = screen.getByRole('button')
  expect(btn).toHaveAccessibleName(/show/i)

  const openEye = screen.getByTestId('openEye')
  expect(openEye).toBeInTheDocument()

  const input = screen.getByLabelText(/^password$/i)
  expect(input).toHaveAttribute('type', 'password')

  const inputAriaDescr = input.getAttribute('aria-describedby')
  expect(inputAriaDescr).not.toContain('passwordRules')

  const strengthMeter = screen.queryByRole('status')
  expect(strengthMeter).not.toBeInTheDocument()
})

test("the container's border is red if the form is submitted and there is an error", () => {
  useFormContext.mockReturnValue(setFormContext(true, 'error'))

  render(
    <>
      <Label htmlFor="password" labelText="Password" />
      <PasswordInput />
    </>
  )

  const container = screen.getByTestId('container')
  expect(container).toHaveClass('border-red-600')
})

test('the password input has "passwordRules" to aria-describedby if there is some rules', () => {
  useFormContext.mockReturnValue(setFormContext())

  render(
    <>
      <Label htmlFor="password" labelText="Password" />
      <PasswordInput hasRules />
    </>
  )

  const input = screen.getByLabelText(/^password$/i)
  const ariaDescribedby = input.getAttribute('aria-describedby')
  expect(ariaDescribedby).toContain('passwordRules')
})

test('the password can be shown', () => {
  useFormContext.mockReturnValue(setFormContext())

  render(
    <>
      <Label htmlFor="password" labelText="Password" />
      <PasswordInput />
    </>
  )

  const btn = screen.getByRole('button')

  userEvent.click(btn)
  expect(btn).toHaveAccessibleName(/hide/i)

  const openEye = screen.queryByTestId('openEye')
  expect(openEye).not.toBeInTheDocument()

  const closeEye = screen.getByTestId('closeEye')
  expect(closeEye).toBeInTheDocument()

  const input = screen.getByLabelText(/^password$/i)
  expect(input).toHaveAttribute('type', 'text')

  const inputAriaDescr = input.getAttribute('aria-describedby')
  expect(inputAriaDescr).not.toContain('passwordRules')
})

test("the password strength renders and take into account the other fields' values", () => {
  useFormContext.mockReturnValue(setFormContext())

  render(
    <>
      <Label htmlFor="password" labelText="Password" />
      <PasswordInput showStrength />
    </>
  )

  const input = screen.getByLabelText(/^password$/i)
  const red = screen.getByTestId('red')
  const yellow = screen.getByTestId('yellow')
  const green = screen.getByTestId('green')

  userEvent.type(input, 'english')

  expect(red).toHaveClass('bg-red-500')
  expect(yellow).not.toHaveClass('bg-yellow-500')
  expect(green).not.toHaveClass('bg-green-500')

  userEvent.clear(input)
  userEvent.type(input, 'english rigole')

  expect(red).not.toHaveClass('bg-red-500')
  expect(yellow).toHaveClass('bg-yellow-500')
  expect(green).not.toHaveClass('bg-green-500')

  userEvent.clear(input)
  userEvent.type(input, 'english rigole tile')

  expect(red).not.toHaveClass('bg-red-500')
  expect(yellow).not.toHaveClass('bg-yellow-500')
  expect(green).toHaveClass('bg-green-500')

  userEvent.clear(input)
  userEvent.type(input, 'John Doe') // value of another field

  expect(red).toHaveClass('bg-red-500')
  expect(yellow).not.toHaveClass('bg-yellow-500')
  expect(green).not.toHaveClass('bg-green-500')
})
