import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterOptions } from 'react-hook-form'
import Input from '../../components/Input'
import Label from '../../components/Label'

const setFocus = jest.fn()

const useFormContext = jest.spyOn(require('react-hook-form'), 'useFormContext')

const setFormContext = (isSubmitted: boolean, message?: string) => ({
  formState: { isSubmitted, errors: message ? { test: { message } } : {} },
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
      name="test"
      onChange={handleChange}
      onBlur={handleBlur}
      className="red"
    />
  )

  const input = screen.getByRole('textbox')
  expect(input).toHaveAttribute('id', 'test')
  expect(input).toHaveAttribute('name', 'test')
  expect(input).toHaveClass('red', 'border-indigo-600')

  userEvent.type(input, 'a')
  expect(handleChange).toHaveBeenCalledTimes(1)

  userEvent.tab()
  expect(handleBlur).toHaveBeenCalledTimes(1)

  expect(setFocus).not.toHaveBeenCalled()
})

test('the textarea renders', () => {
  useFormContext.mockReturnValue(setFormContext(false))

  render(
    <Input name="test" onChange={handleChange} onBlur={handleBlur} isTextArea />
  )

  const textarea = screen.getByRole('textbox')
  expect(textarea.tagName).toBe('TEXTAREA')
})

test('the input has the focus', () => {
  useFormContext.mockReturnValue(setFormContext(false))

  render(
    <Input
      type="text"
      name="test"
      onChange={handleChange}
      onBlur={handleBlur}
      needFocus
    />
  )

  expect(setFocus).toHaveBeenNthCalledWith(1, 'test')
})

test("the input's border is red if the form is submitted and there is an error", () => {
  useFormContext.mockReturnValueOnce(setFormContext(true, 'Error'))

  render(
    <Input
      type="text"
      name="test"
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )

  const input = screen.getByRole('textbox')
  expect(input).toHaveClass('border-red-600')
})

test("the input's border is not red if the form is submitted and there is no error", () => {
  useFormContext.mockReturnValueOnce(setFormContext(true))

  render(
    <Input
      type="text"
      name="test"
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )

  const input = screen.getByRole('textbox')
  expect(input).toHaveClass('border-indigo-600')
})

test('the file input is red if the form is submitted and there is an error', () => {
  useFormContext.mockReturnValueOnce(setFormContext(true, 'error'))

  render(
    <>
      <Label labelText="Test" htmlFor="test" />
      <Input type="file" name="test" />
    </>
  )

  const input = screen.getByLabelText(/test/i)
  expect(input).toHaveClass('file:bg-red-200')
})

test('the file input is not red if the form is submitted and there is no error', () => {
  useFormContext.mockReturnValueOnce(setFormContext(true))

  render(
    <>
      <Label labelText="Test" htmlFor="test" />
      <Input type="file" name="test" />
    </>
  )

  const input = screen.getByLabelText(/test/i)
  expect(input).toHaveClass('file:bg-indigo-200')
})

test('the file input is not red if the form is not submitted', () => {
  useFormContext.mockReturnValueOnce(setFormContext(false))

  render(
    <>
      <Label labelText="Test" htmlFor="test" />
      <Input type="file" name="test" />
    </>
  )

  const input = screen.getByLabelText(/test/i)
  expect(input).toHaveClass('file:bg-indigo-200')
})
