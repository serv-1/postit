import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterOptions } from 'react-hook-form'
import Label from '../../components/Label'
import PasswordInput from '../../components/PasswordInput'

const useFormContext = jest.spyOn(require('react-hook-form'), 'useFormContext')

const setFormContext = () => ({
  register: jest.fn((name: string, opt: RegisterOptions) => ({
    onChange: opt.onChange,
  })),
  setFocus: jest.fn(),
  getValues: () => ({ name: 'John Doe', password: 'my password' }),
  formState: { isSubmitted: false },
})

beforeEach(() => useFormContext.mockReturnValue(setFormContext()))

const factory = (showStrength?: boolean, hasRules?: boolean) => {
  render(
    <>
      <Label htmlFor="password" labelText="Password" />
      <PasswordInput showStrength={showStrength} hasRules={hasRules} />
    </>
  )
}

test('the open eye btn and the input render', () => {
  factory(true, true)

  const btn = screen.getByRole('button')
  expect(btn).toHaveAccessibleName(/show/i)

  const openEye = screen.getByTestId('openEye')
  expect(openEye).toBeInTheDocument()

  const closeEye = screen.queryByTestId('closeEye')
  expect(closeEye).not.toBeInTheDocument()

  const input = screen.getByLabelText(/^password$/i)
  expect(input).toHaveAttribute('type', 'password')

  const inputAriaDescr = input.getAttribute('aria-describedby')
  expect(inputAriaDescr).toContain('passwordRules')

  const strength = screen.queryByRole('status')
  expect(strength).not.toBeInTheDocument()
})

test('the visibility button shows the password', () => {
  factory()

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
  factory(true)

  const input = screen.getByLabelText(/^password$/i)
  userEvent.type(input, 'english')

  const strength = screen.getByRole('status')
  expect(strength).toHaveClass('bg-danger')

  userEvent.clear(input)
  userEvent.type(input, 'english rigole')
  expect(strength).toHaveClass('bg-warning')

  userEvent.clear(input)
  userEvent.type(input, 'english rigole tile')
  expect(strength).toHaveClass('bg-success')

  userEvent.clear(input)
  userEvent.type(input, 'John Doe') // value of another field
  expect(strength).toHaveClass('bg-danger')
})

test('the password strength does not render even if the user has typed something', () => {
  factory()

  const input = screen.getByLabelText(/^password$/i)
  userEvent.type(input, 'John Doe')

  const strength = screen.queryByRole('status')
  expect(strength).not.toBeInTheDocument()
})
