import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterOptions } from 'react-hook-form'
import Input from '../../components/Input'

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

const handleChange = jest.fn()
const handleBlur = jest.fn()

test('the input renders', () => {
  useFormContext.mockReturnValue(setFormContext(false))

  render(
    <Input
      type="text"
      name="username"
      onChange={handleChange}
      onBlur={handleBlur}
      needFocus
      className="red"
    />
  )

  const input = screen.getByRole('textbox')
  expect(input).toHaveAttribute('id', 'username')
  expect(input).toHaveAttribute('name', 'username')
  expect(input).toHaveClass('red')
  expect(input).not.toHaveClass('is-invalid', 'is-valid')

  userEvent.type(input, 'a')
  expect(handleChange).toHaveBeenCalledTimes(1)

  userEvent.tab()
  expect(handleBlur).toHaveBeenCalledTimes(1)

  expect(setFocus).toHaveBeenNthCalledWith(1, 'username')
})

test('the textarea renders', () => {
  useFormContext.mockReturnValue(setFormContext(false))

  render(
    <Input
      name="username"
      onChange={handleChange}
      onBlur={handleBlur}
      isTextArea
    />
  )

  const textarea = screen.getByRole('textbox')
  expect(textarea.tagName).toBe('TEXTAREA')
})

test('the input do not have the focus', () => {
  useFormContext.mockReturnValue(setFormContext(false))

  render(
    <Input
      type="text"
      name="username"
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )

  expect(setFocus).not.toHaveBeenCalled()
})

test('the input have is-invalid class if the form is submitted and there is an error', () => {
  useFormContext.mockReturnValueOnce(setFormContext(true, 'Error'))

  render(
    <Input
      type="text"
      name="username"
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )

  const input = screen.getByRole('textbox')
  expect(input).toHaveClass('is-invalid')
  expect(input).not.toHaveClass('is-valid')
})

test('the input have is-valid class if the form is submitted and there is no error', () => {
  useFormContext.mockReturnValueOnce(setFormContext(true))

  render(
    <Input
      type="text"
      name="username"
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )

  const input = screen.getByRole('textbox')
  expect(input).toHaveClass('is-valid')
  expect(input).not.toHaveClass('is-invalid')
})
