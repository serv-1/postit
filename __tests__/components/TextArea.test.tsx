import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterOptions } from 'react-hook-form'
import TextArea from '../../components/TextArea'

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

beforeEach(() => useFormContext.mockReturnValue(setFormContext(false)))

it('renders', async () => {
  const onChange = jest.fn()

  render(<TextArea name="test" registerOptions={{ onChange }} required />)

  const textarea = screen.getByRole('textbox')
  expect(textarea).toHaveAttribute('name', 'test')
  expect(textarea).toHaveAttribute('id', 'test')
  expect(textarea).toHaveAttribute('aria-describedby', 'testFeedback')
  expect(textarea).toBeRequired()

  await userEvent.type(textarea, 'a')
  expect(onChange).toHaveBeenCalledTimes(1)

  expect(setFocus).not.toHaveBeenCalled()
})

it('has the focus', () => {
  render(<TextArea name="test" needFocus />)
  expect(setFocus).toHaveBeenNthCalledWith(1, 'test')
})

it('has a red border if the form is submitted and there is an error', () => {
  useFormContext.mockReturnValue(setFormContext(true, 'error'))
  render(<TextArea name="test" />)
  const textarea = screen.getByRole('textbox')
  expect(textarea.className).toContain('red')
})

it("hasn't a red border if the form is submitted and there is no error", () => {
  useFormContext.mockReturnValue(setFormContext(true))
  render(<TextArea name="test" />)
  const textarea = screen.getByRole('textbox')
  expect(textarea.className).not.toContain('red')
})
