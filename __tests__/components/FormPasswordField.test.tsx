import { render, screen } from '@testing-library/react'
import FormPasswordField from '../../components/FormPasswordField'

const useFormContext = jest.spyOn(require('react-hook-form'), 'useFormContext')

beforeEach(() => {
  useFormContext.mockReturnValue({
    formState: { isSubmitted: false, errors: {} },
    register: jest.fn(),
    setFocus: jest.fn(),
    getValues: () => ({ password: 'super strong pw' }),
  })
})

test('the forgot password link and the password rules render', () => {
  render(<FormPasswordField showForgotPasswordLink showRules />)

  const link = screen.getByRole('link')
  expect(link).toBeInTheDocument()

  const rules = screen.getByRole('note')
  expect(rules).toBeInTheDocument()
})

test('the forgot password link and the password rules do no render', () => {
  render(<FormPasswordField />)

  const link = screen.queryByRole('link')
  expect(link).not.toBeInTheDocument()

  const rules = screen.queryByRole('note')
  expect(rules).not.toBeInTheDocument()
})
