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

interface FactoryParams {
  showForgotPasswordLink?: boolean
  showRules?: boolean
}

const factory = ({ showRules, showForgotPasswordLink }: FactoryParams = {}) => {
  render(
    <FormPasswordField
      showForgotPasswordLink={showForgotPasswordLink}
      showRules={showRules}
    />
  )
}

describe('FormPasswordField', () => {
  describe('Rules', () => {
    it('should not be rendered if "showRules" is undefined', () => {
      factory()
      expect(screen.queryByRole('note')).not.toBeInTheDocument()
    })

    it('should be rendered if "showRules" is defined', () => {
      factory({ showRules: true })
      expect(screen.getByRole('note')).toBeInTheDocument()
    })
  })

  describe('Forgot password link', () => {
    it('should not be rendered if "showForgotPasswordLink" is undefined', () => {
      factory()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('should be rendered if "showForgotPasswordLink" is defined', () => {
      factory({ showForgotPasswordLink: true })
      expect(screen.getByRole('link')).toBeInTheDocument()
    })
  })
})
