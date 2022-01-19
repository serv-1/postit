import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterOptions } from 'react-hook-form'
import TextInput from '../../components/TextInput'

const setFocus = jest.fn()

const useFormContext = jest.spyOn(require('react-hook-form'), 'useFormContext')

const setFormContext = (isSubmitted: boolean, message?: string) => ({
  formState: { isSubmitted, errors: message ? { username: { message } } : {} },
  register: jest.fn((name: string, options: RegisterOptions) => ({
    name,
    onBlur: options.onBlur,
    onChange: options.onChange,
  })),
  setFocus,
})

beforeEach(() => useFormContext.mockReturnValue(setFormContext(false)))

const handleChange = jest.fn()
const handleBlur = jest.fn()

const factory = (needFocus: boolean = false) => {
  render(
    <TextInput
      name="username"
      onChange={handleChange}
      onBlur={handleBlur}
      needFocus={needFocus}
      className="red"
    />
  )
}

test('the input renders', () => {
  factory(true)

  const input = screen.getByRole('textbox')
  expect(input).toHaveAttribute('id', 'username')
  expect(input).toHaveAttribute('name', 'username')
  expect(input).toHaveClass('red')
  expect(input).not.toHaveClass('is-invalid', 'is-valid')

  userEvent.type(input, 'a')
  expect(handleChange).toHaveBeenCalledTimes(1)

  userEvent.tab()
  expect(handleBlur).toHaveBeenCalledTimes(1)

  expect(setFocus).toHaveBeenCalledWith('username')
  expect(setFocus).toHaveBeenCalledTimes(1)
})

test('the input do not have the focus', () => {
  factory()

  expect(setFocus).not.toHaveBeenCalled()
})

test('the input have is-invalid class if the form is submitted and there is an error', () => {
  useFormContext.mockReturnValueOnce(setFormContext(true, 'Error'))

  factory()

  const input = screen.getByRole('textbox')
  expect(input).toHaveClass('is-invalid')
  expect(input).not.toHaveClass('is-valid')
})

test('the input have is-valid class if the form is submitted and there is no error', () => {
  useFormContext.mockReturnValueOnce(setFormContext(true))

  factory()

  const input = screen.getByRole('textbox')
  expect(input).toHaveClass('is-valid')
  expect(input).not.toHaveClass('is-invalid')
})
