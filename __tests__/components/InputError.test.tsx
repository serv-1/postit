import { render, screen } from '@testing-library/react'
import InputError from '../../components/InputError'

const useFormContext = jest.spyOn(require('react-hook-form'), 'useFormContext')

const setFormContext = (isSubmitted: boolean, message?: string) => ({
  formState: { isSubmitted, errors: message ? { email: { message } } : {} },
  register: jest.fn(),
  setFocus: jest.fn(),
})

beforeEach(() => useFormContext.mockReturnValue(setFormContext(true, 'Error')))

const factory = () => {
  render(<InputError inputName="email" />)
}

describe('InputError', () => {
  it('should be rendered if the form is submitted and there is an error', () => {
    factory()
    expect(screen.getByRole('alert')).toHaveTextContent('Error')
  })

  it('should not be rendered if the form is not submitted', () => {
    useFormContext.mockReturnValue(setFormContext(false))
    factory()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('should not be rendered if the form is submitted and there is no error', () => {
    useFormContext.mockReturnValue(setFormContext(true))
    factory()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('should use the given "inputName"', () => {
    factory()
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'feedbackEmail')
  })
})
