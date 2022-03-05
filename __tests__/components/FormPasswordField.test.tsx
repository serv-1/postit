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

test('the password rules render', () => {
  render(<FormPasswordField showRules />)

  const rules = screen.getByRole('note')
  expect(rules).toBeInTheDocument()
})

test('the password rules do not render', () => {
  render(<FormPasswordField />)

  const rules = screen.queryByRole('note')
  expect(rules).not.toBeInTheDocument()
})
