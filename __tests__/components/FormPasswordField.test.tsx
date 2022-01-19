import { render, screen } from '@testing-library/react'
import FormPasswordField from '../../components/FormPasswordField'

const useFormContext = jest.spyOn(require('react-hook-form'), 'useFormContext')

const setFormContext = (isSubmitted: boolean, message?: string) => ({
  formState: { isSubmitted, errors: message ? { password: { message } } : {} },
  register: jest.fn(),
  setFocus: jest.fn(),
  getValues: () => ({ password: 'super strong pw' }),
})

beforeEach(() => useFormContext.mockReturnValue(setFormContext(false)))

const factory = (showRules?: boolean, showForgotPasswordLink?: boolean) => {
  render(
    <FormPasswordField
      showForgotPasswordLink={showForgotPasswordLink}
      showRules={showRules}
    />
  )
}

test('the forgot password link and the password rules render', () => {
  factory(true, true)

  const link = screen.getByRole('link')
  expect(link).toBeInTheDocument()

  const rules = screen.getByRole('note')
  expect(rules).toBeInTheDocument()
})

test('the forgot password link and the password rules do no render', () => {
  factory(false, false)

  const link = screen.queryByRole('link')
  expect(link).not.toBeInTheDocument()

  const rules = screen.queryByRole('note')
  expect(rules).not.toBeInTheDocument()
})
