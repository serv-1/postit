import { render, screen } from '@testing-library/react'
import InputError from '../../components/InputError'

const useFormContext = jest.spyOn(require('react-hook-form'), 'useFormContext')

const setFormContext = (isSubmitted: boolean, message?: string) => ({
  formState: { isSubmitted, errors: message ? { email: { message } } : {} },
  register: jest.fn(),
  setFocus: jest.fn(),
})

interface FormFields {
  email: string
}

test('the alert renders if the form is submitted an there is an error', () => {
  useFormContext.mockReturnValue(setFormContext(true, 'Error'))

  render(<InputError<FormFields> inputName="email" />)

  const alert = screen.getByRole('alert')
  expect(alert).toHaveTextContent('Error')
  expect(alert).toHaveAttribute('id', 'emailFeedback')
})

test("the alert doesn't render if the form isn't submitted even if there is an error", () => {
  useFormContext.mockReturnValue(setFormContext(false, 'Error'))

  render(<InputError<FormFields> inputName="email" />)

  const alert = screen.queryByRole('alert')
  expect(alert).not.toBeInTheDocument()
})
