import PasswordInput from '../../components/PasswordInput'
import { render, screen } from '@testing-library/react'
import { FieldError, UseFormRegister } from 'react-hook-form'
import userEvent from '@testing-library/user-event'

type Props = {
  rules?: boolean
  showBtn?: boolean
  strength?: boolean
  isFormSubmitted?: boolean
  error?: FieldError
}

const labelName = 'Password'
const name = 'password'
const error = {
  type: 'required',
  message: 'The password is required.',
}
const register: UseFormRegister<any> = (name: string) => ({
  onChange: jest.fn(),
  onBlur: jest.fn(),
  ref: jest.fn(),
  name,
})

const factory = ({
  rules = false,
  showBtn = false,
  strength = false,
  isFormSubmitted = false,
  error,
}: Props = {}) => {
  render(
    <PasswordInput
      labelName={labelName}
      rules={rules}
      showBtn={showBtn}
      strength={strength}
      name={name}
      isFormSubmitted={isFormSubmitted}
      error={error}
      register={register}
    />
  )
}

describe('PasswordInput', () => {
  it('should use the name for html attributes', () => {
    factory({ rules: true, strength: true, isFormSubmitted: true, error })
    const input = screen.getByLabelText(labelName)
    userEvent.type(input, 'ah')
    expect(screen.getByText(labelName)).toHaveAttribute('for', name)
    expect(screen.getByRole('note')).toHaveAttribute('id', name + 'Rules')
    expect(input).toHaveAttribute('id', name)
    expect(input).toHaveAttribute('name', name)
    expect(input).toHaveAttribute(
      'aria-describedby',
      `${name}Feedback ${name}Rules ${name}Strength visibilityBtn`
    )
    expect(screen.getByRole('status')).toHaveAttribute('id', name + 'Strength')
    expect(screen.getByRole('alert')).toHaveAttribute('id', name + 'Feedback')
  })

  describe('Label', () => {
    it('should display the label name', () => {
      factory()
      expect(screen.getByText(labelName)).toBeInTheDocument()
    })
  })

  describe('Rules', () => {
    it('should render the rules if rules is true', () => {
      factory({ rules: true })
      expect(screen.getByRole('note')).toBeInTheDocument()
    })

    it('should not render the rules if rules is false', () => {
      factory()
      expect(screen.queryByRole('note')).not.toBeInTheDocument()
    })
  })

  describe('Show/hide button', () => {
    it('should render the show/hide btn if showBtn is true', () => {
      factory({ showBtn: true })
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should not render the show/hide btn if showBtn is false', () => {
      factory()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should show the password and have hide text on click on show', () => {
      factory({ showBtn: true })
      const btn = screen.getByRole('button')
      userEvent.click(btn)
      expect(btn).toHaveTextContent('hide')
      expect(screen.getByLabelText(labelName)).toHaveAttribute('type', 'text')
    })

    it('should hide the password and have show text on click on hide', () => {
      factory({ showBtn: true })
      const btn = screen.getByRole('button')
      userEvent.click(btn)
      userEvent.click(btn)
      expect(btn).toHaveTextContent('show')
      expect(screen.getByLabelText(labelName)).toHaveAttribute(
        'type',
        'password'
      )
    })
  })

  describe('Input', () => {
    it('should have password type at the first render', () => {
      factory()
      expect(screen.getByLabelText(labelName)).toHaveAttribute(
        'type',
        'password'
      )
    })

    it('should not have is-valid and is-invalid class when the form has not been submitted yet', () => {
      factory()
      const input = screen.getByLabelText(labelName)
      expect(input).not.toHaveClass('is-valid')
      expect(input).not.toHaveClass('is-invalid')
    })

    it('should have is-valid class when the form is submitted and there is no error', () => {
      factory({ isFormSubmitted: true })
      expect(screen.getByLabelText(labelName)).toHaveClass('is-valid')
    })

    it('should have is-invalid class when the form is submitted and there is an error', () => {
      factory({ isFormSubmitted: true, error })
      expect(screen.getByLabelText(labelName)).toHaveClass('is-invalid')
    })
  })

  describe('Strength', () => {
    it('should render the strength if strength is true', () => {
      factory({ strength: true })
      userEvent.type(screen.getByLabelText(labelName), 'ah')
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should not render the strength if strength is false', () => {
      factory()
      userEvent.type(screen.getByLabelText(labelName), 'ah')
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('should render the strength only when the password is being typed', () => {
      factory({ strength: true })
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('should display the estimated time to crack the password', () => {
      factory({ strength: true })
      userEvent.type(screen.getByLabelText(labelName), 'ah')
      expect(screen.getByRole('status')).toHaveTextContent(
        /^need less than a second to crack$/i
      )
    })

    it('should have bg-danger class if the password is weak', () => {
      factory({ strength: true })
      userEvent.type(screen.getByLabelText(labelName), 'ah')
      expect(screen.getByRole('status')).toHaveClass('bg-danger')
    })

    it('should have bg-warning class if the password is medium', () => {
      factory({ strength: true })
      userEvent.type(screen.getByLabelText(labelName), 'tire bridge')
      expect(screen.getByRole('status')).toHaveClass('bg-warning')
    })

    it('should have bg-success class if the password is strong', () => {
      factory({ strength: true })
      userEvent.type(screen.getByLabelText(labelName), 'tire bridge rainbow')
      expect(screen.getByRole('status')).toHaveClass('bg-success')
    })
  })

  describe('Error feedback', () => {
    it('should be rendered when the form is submitted and there is an error', () => {
      factory({ isFormSubmitted: true, error })
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent(error.message)
    })

    it('should not be rendered when the form is submitted and there is no error', () => {
      factory({ isFormSubmitted: true })
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('should not be rendered when the form is not submitted even if there is an error', () => {
      factory({ error })
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})
