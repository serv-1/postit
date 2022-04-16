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

beforeEach(() => useFormContext.mockReturnValue(setFormContext(false)))

interface FormFields {
  test: string
}

it('renders', async () => {
  const onChange = jest.fn()

  render(
    <Input<FormFields>
      type="text"
      name="test"
      registerOptions={{ onChange }}
      className="blue"
    />
  )

  const input = screen.getByRole('textbox')
  expect(input).toHaveAttribute('id', 'test')
  expect(input).toHaveAttribute('name', 'test')
  expect(input).toHaveAttribute('aria-describedby', 'testFeedback')
  expect(input).toHaveClass('blue')
  expect(input.className).toContain('border')
  expect(input.className).not.toContain('red')
  expect(input.className).not.toContain('file')

  await userEvent.type(input, 'a')
  expect(onChange).toHaveBeenCalledTimes(1)

  expect(setFocus).not.toHaveBeenCalled()

  const container = screen.queryByTestId('container')
  expect(container).not.toBeInTheDocument()
})

it('has the focus', () => {
  render(<Input<FormFields> type="text" name="test" needFocus />)
  expect(setFocus).toHaveBeenNthCalledWith(1, 'test')
})

test('its border is red if the form is submitted and there is an error', () => {
  useFormContext.mockReturnValueOnce(setFormContext(true, 'Error'))

  render(<Input<FormFields> type="text" name="test" />)

  const input = screen.getByRole('textbox')
  expect(input.className).toContain('red')
})

test("its border isn't red if the form is submitted and there is no error", () => {
  useFormContext.mockReturnValueOnce(setFormContext(true))

  render(<Input<FormFields> type="text" name="test" />)

  const input = screen.getByRole('textbox')
  expect(input.className).not.toContain('red')
})

test('file input has different class', () => {
  render(
    <>
      <label htmlFor="test">Test</label>
      <Input<FormFields> type="file" name="test" />
    </>
  )

  const input = screen.getByLabelText('Test')
  expect(input.className).toContain('file')
})

test('the add-on renders', () => {
  render(
    <Input<FormFields> type="text" name="test" addOn="@" addOnClass="dark" />
  )

  const addOn = screen.getByText('@')
  expect(addOn).toHaveClass('dark')

  const container = screen.getByTestId('container')
  expect(container.className).toContain('border')
})
