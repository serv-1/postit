import { render, screen } from '@testing-library/react'
import { FieldError, UseFormRegister, UseFormSetFocus } from 'react-hook-form'
import TextInput from '../../components/TextInput'

type Props = {
  email?: boolean
  isFormSubmitted?: boolean
  error?: FieldError
  setFocus?: UseFormSetFocus<any>
}

const labelName = 'Test'
const name = 'test'
const error = {
  type: 'required',
  message: 'This field is required.',
}
const register: UseFormRegister<any> = (name: string) => ({
  onChange: jest.fn(),
  onBlur: jest.fn(),
  ref: jest.fn(),
  name,
})

const setFocus = jest.fn()

const factory = ({
  email = false,
  isFormSubmitted = false,
  error,
  setFocus,
}: Props = {}) => {
  render(
    <TextInput
      labelName={labelName}
      email={email}
      name={name}
      isFormSubmitted={isFormSubmitted}
      error={error}
      register={register}
      setFocus={setFocus}
    />
  )
}

afterEach(() => jest.resetAllMocks())

describe('TextInput', () => {
  it('should use the name for html attributes', () => {
    factory({ isFormSubmitted: true, error })
    const input = screen.getByRole('textbox')
    expect(screen.getByText(labelName)).toHaveAttribute('for', name)
    expect(input).toHaveAttribute('name', name)
    expect(input).toHaveAttribute('id', name)
    expect(input).toHaveAccessibleDescription(error.message)
  })

  describe('Label', () => {
    it('should display the label name', () => {
      factory()
      expect(screen.getByText(labelName)).toBeInTheDocument()
    })
  })

  describe('Input', () => {
    it('should render an input of type text if email is false', () => {
      factory()
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
    })

    it('should render an input of type email if email is true', () => {
      factory({ email: true })
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    })

    it('should be focused if setFocus is defined', () => {
      factory({ setFocus })
      expect(setFocus).toHaveBeenCalledTimes(1)
    })

    it('should not be focused if setFocus is undefined', () => {
      factory()
      expect(setFocus).not.toHaveBeenCalled()
      expect(screen.getByRole('textbox')).not.toHaveFocus()
    })

    it('should not have is-valid and is-invalid class when the form has not been submitted yet', () => {
      factory()
      const input = screen.getByRole('textbox')
      expect(input).not.toHaveClass('is-valid')
      expect(input).not.toHaveClass('is-invalid')
    })

    it('should have is-valid class when the form is submitted and there is no error', () => {
      factory({ isFormSubmitted: true })
      expect(screen.getByRole('textbox')).toHaveClass('is-valid')
    })

    it('should have is-invalid class when the form is submitted and there is an error', () => {
      factory({ isFormSubmitted: true, error })
      expect(screen.getByRole('textbox')).toHaveClass('is-invalid')
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
