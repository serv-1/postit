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

beforeEach(() => useFormContext.mockReturnValue(setFormContext()))

test('the open eye button and the input render', () => {
  render(
    <>
      <Label htmlFor="password" labelText="Password" />
      <PasswordInput showStrength hasRules />
    </>
  )

  const btn = screen.getByRole('button')
  expect(btn).toHaveAccessibleName(/show/i)

  const openEye = screen.getByTestId('openEye')
  expect(openEye).toBeInTheDocument()
  expect(openEye).not.toHaveClass('border-danger', 'border-success')

  const closeEye = screen.queryByTestId('closeEye')
  expect(closeEye).not.toBeInTheDocument()

  const input = screen.getByLabelText(/^password$/i)
  expect(input).toHaveAttribute('type', 'password')

  const inputAriaDescr = input.getAttribute('aria-describedby')
  expect(inputAriaDescr).toContain('passwordRules')
})

test('the eye button shows the password', () => {
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

test('the eye button border is red if the form is Submitted and there is an error', () => {
  useFormContext.mockReturnValue(setFormContext(true, 'error'))

  render(
    <>
      <Label htmlFor="password" labelText="Password" />
      <PasswordInput />
    </>
  )

  const btn = screen.getByRole('button')
  expect(btn).toHaveClass('border-danger')
  expect(btn).not.toHaveClass('border-success')
})

test('the eye button border is green if the form is Submitted and there is no error', () => {
  useFormContext.mockReturnValue(setFormContext(true))

  render(
    <>
      <Label htmlFor="password" labelText="Password" />
      <PasswordInput />
    </>
  )

  const btn = screen.getByRole('button')
  expect(btn).toHaveClass('border-success')
  expect(btn).not.toHaveClass('border-danger')
})

test("the password strength renders and take into account the other fields' values", () => {
  render(
    <>
      <Label htmlFor="password" labelText="Password" />
      <PasswordInput showStrength />
    </>
  )

  const input = screen.getByLabelText(/^password$/i)
  const redDot = screen.getByTestId('redDot')
  const yellowDot = screen.getByTestId('yellowDot')
  const greenDot = screen.getByTestId('greenDot')

  userEvent.type(input, 'english')

  expect(redDot).toHaveClass('bg-danger')
  expect(yellowDot).not.toHaveClass('bg-warning')
  expect(greenDot).not.toHaveClass('bg-success')

  userEvent.clear(input)
  userEvent.type(input, 'english rigole')

  expect(redDot).not.toHaveClass('bg-danger')
  expect(yellowDot).toHaveClass('bg-warning')
  expect(greenDot).not.toHaveClass('bg-success')

  userEvent.clear(input)
  userEvent.type(input, 'english rigole tile')

  expect(redDot).not.toHaveClass('bg-danger')
  expect(yellowDot).not.toHaveClass('bg-warning')
  expect(greenDot).toHaveClass('bg-success')

  userEvent.clear(input)
  userEvent.type(input, 'John Doe') // value of another field

  expect(redDot).toHaveClass('bg-danger')
  expect(yellowDot).not.toHaveClass('bg-warning')
  expect(greenDot).not.toHaveClass('bg-success')
})
