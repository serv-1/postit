import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterOptions } from 'react-hook-form'
import Label from '../../components/Label'
import PasswordInput from '../../components/PasswordInput'

const useFormContext = jest.spyOn(require('react-hook-form'), 'useFormContext')

const setFormContext = () => ({
  register: jest.fn((name: string, opt: RegisterOptions) => ({
    onChange: opt.onChange,
  })),
  setFocus: jest.fn(),
  getValues: () => ({ password: 'english rigole zoro', name: 'John Doe' }),
  formState: { isSubmitted: false },
})

beforeEach(() => useFormContext.mockReturnValue(setFormContext()))

interface FactoryParams {
  showStrength?: boolean
  needFocus?: boolean
  hasRules?: boolean
}

const factory = ({ showStrength, needFocus, hasRules }: FactoryParams = {}) => {
  render(
    <>
      <Label htmlFor="password" labelText="Password" />
      <PasswordInput
        showStrength={showStrength}
        needFocus={needFocus}
        hasRules={hasRules}
      />
    </>
  )
}

describe('PasswordInput', () => {
  describe('Visibility Button', () => {
    it('should render an eye opened when the password is hidden', () => {
      factory()
      expect(screen.getByRole('button')).toHaveAccessibleName(/show/i)
      expect(screen.getByTestId('eyeOpened')).toBeInTheDocument()
    })

    it('should render an eye closed when the password is shown', () => {
      factory()
      userEvent.click(screen.getByRole('button'))
      expect(screen.getByRole('button')).toHaveAccessibleName(/hide/i)
      expect(screen.getByTestId('eyeClosed')).toBeInTheDocument()
    })
  })

  describe('Input', () => {
    it('should be of type "password" by default', () => {
      factory()
      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute(
        'type',
        'password'
      )
    })

    it('should be of type "text" if the password needs to be shown', () => {
      factory()
      userEvent.click(screen.getByRole('button'))
      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute(
        'type',
        'text'
      )
    })

    it('should be of type "password" if the password needs to be hidden', () => {
      factory()
      userEvent.dblClick(screen.getByRole('button'))
      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute(
        'type',
        'password'
      )
    })

    it('should have "passwordRules" to "aria-describedby" value if "hasRules" is defined', () => {
      factory({ hasRules: true })
      const input = screen.getByLabelText(/^password$/i)
      expect(input.getAttribute('aria-describedby')).toContain('passwordRules')
    })

    it('should not have "passwordRules" to "aria-describedby" value if "hasRules" is undefined"', () => {
      factory()
      const input = screen.getByLabelText(/^password$/i)
      expect(input.getAttribute('aria-describedby')).not.toContain(
        'passwordRules'
      )
    })
  })

  describe('Strength', () => {
    it('should be rendered if "showStrength" is defined', () => {
      factory({ showStrength: true })
      userEvent.type(screen.getByLabelText(/^password$/i), 'haha')
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should not be rendered if "showStrength" is undefined', () => {
      factory()
      userEvent.type(screen.getByLabelText(/^password$/i), 'haha')
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('should not be rendered while the user has not type something', () => {
      factory({ showStrength: true })
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('should be green if the password is strong', () => {
      factory({ showStrength: true })
      const pw = 'english rigole halt'
      userEvent.type(screen.getByLabelText(/^password$/i), pw)
      expect(screen.getByRole('status').className).toContain('success')
    })

    it('should be yellow if the password is strong', () => {
      factory({ showStrength: true })
      userEvent.type(screen.getByLabelText(/^password$/i), 'english rigole')
      expect(screen.getByRole('status').className).toContain('warning')
    })

    it('should be red if the password is strong', () => {
      factory({ showStrength: true })
      userEvent.type(screen.getByLabelText(/^password$/i), 'english')
      expect(screen.getByRole('status').className).toContain('danger')
    })

    it('should render the estimated time to crack the password', () => {
      factory({ showStrength: true })
      userEvent.type(screen.getByLabelText(/^password$/i), 'english')
      expect(screen.getByRole('status')).toHaveTextContent(/second/i)
    })

    it("should take into account the other fields' values", () => {
      factory({ showStrength: true })
      const pw = 'english rigole zoro'
      userEvent.type(screen.getByLabelText(/^password$/i), pw)
      expect(screen.getByRole('status')).toHaveTextContent(/second/i)
    })
  })
})
