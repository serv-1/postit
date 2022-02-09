import { render, screen } from '@testing-library/react'
import InputError from '../../components/InputError'

const useFormContext = jest.spyOn(require('react-hook-form'), 'useFormContext')

const setFormContext = (isSubmitted: boolean, message?: string) => ({
  formState: { isSubmitted, errors: message ? { email: { message } } : {} },
  register: jest.fn(),
  setFocus: jest.fn(),
})

beforeEach(() => useFormContext.mockReturnValue(setFormContext(true, 'Error')))

test('the alert renders if the form is submitted an there is an error', () => {
  render(<InputError inputName="email" />)

  const alert = screen.getByRole('alert')
  expect(alert).toHaveTextContent('Error')
  expect(alert).toHaveAttribute('id', 'emailFeedback')
})

test('the alert does no render if the form is not submitted even if there is an error', () => {
  useFormContext.mockReturnValue(setFormContext(false, 'Error'))

  render(<InputError inputName="email" />)

  const alert = screen.queryByRole('alert')
  expect(alert).not.toBeInTheDocument()
})
