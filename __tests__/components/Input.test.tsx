import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterOptions } from 'react-hook-form'
import Input from '../../components/Input'

const setFocus = jest.fn()

const useFormContext = jest.spyOn(require('react-hook-form'), 'useFormContext')

const setFormContext = (isSubmitted: boolean, message?: string) => ({
  formState: { isSubmitted, errors: message ? { test: { message } } : {} },
  register: jest.fn((name: string, opt: RegisterOptions) => ({
    name,
    onChange: opt?.onChange,
  })),
  setFocus,
})

interface FormFields {
  test: string
}

test('the input renders', () => {
  const onChange = jest.fn()

  useFormContext.mockReturnValue(setFormContext(false))

  render(
    <Input<FormFields>
      type="text"
      name="test"
      registerOptions={{ onChange }}
      className="red"
    />
  )

  const input = screen.getByRole('textbox')
  expect(input).toHaveAttribute('id', 'test')
  expect(input).toHaveAttribute('name', 'test')
  expect(input).toHaveClass('red', 'border-indigo-600')

  userEvent.type(input, 'a')
  expect(onChange).toHaveBeenCalledTimes(1)

  expect(setFocus).not.toHaveBeenCalled()
})

test('the textarea renders', () => {
  useFormContext.mockReturnValue(setFormContext(false))

  render(<Input<FormFields> name="test" isTextArea />)

  const textarea = screen.getByRole('textbox')
  expect(textarea.tagName).toBe('TEXTAREA')
})

test('the input has the focus', () => {
  useFormContext.mockReturnValue(setFormContext(false))

  render(<Input<FormFields> type="text" name="test" needFocus />)

  expect(setFocus).toHaveBeenNthCalledWith(1, 'test')
})

test("the input's border is red if the form is submitted and there is an error", () => {
  useFormContext.mockReturnValueOnce(setFormContext(true, 'Error'))

  render(<Input<FormFields> type="text" name="test" />)

  const input = screen.getByRole('textbox')
  expect(input).toHaveClass('border-red-600')
})

test("the input's border is not red if the form is submitted and there is no error", () => {
  useFormContext.mockReturnValueOnce(setFormContext(true))

  render(<Input<FormFields> type="text" name="test" />)

  const input = screen.getByRole('textbox')
  expect(input).toHaveClass('border-indigo-600')
})

test('the file input is red if the form is submitted and there is an error', () => {
  useFormContext.mockReturnValueOnce(setFormContext(true, 'error'))

  render(
    <>
      <label htmlFor="test">Test</label>
      <Input<FormFields> type="file" name="test" />
    </>
  )

  const input = screen.getByLabelText(/test/i)
  expect(input).toHaveClass('file:bg-red-200')
})

test('the file input is not red if the form is submitted and there is no error', () => {
  useFormContext.mockReturnValueOnce(setFormContext(true))

  render(
    <>
      <label htmlFor="test">Test</label>
      <Input<FormFields> type="file" name="test" />
    </>
  )

  const input = screen.getByLabelText(/test/i)
  expect(input).toHaveClass('file:bg-indigo-200')
})

test('the file input is not red if the form is not submitted', () => {
  useFormContext.mockReturnValueOnce(setFormContext(false))

  render(
    <>
      <label htmlFor="test">Test</label>
      <Input<FormFields> type="file" name="test" />
    </>
  )

  const input = screen.getByLabelText(/test/i)
  expect(input).toHaveClass('file:bg-indigo-200')
})
