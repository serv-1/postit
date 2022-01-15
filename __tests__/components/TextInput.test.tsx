import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, RegisterOptions, useForm } from 'react-hook-form'
import TextInput from '../../components/TextInput'

const setFocus = jest.fn()

const useFormContext = jest.spyOn(require('react-hook-form'), 'useFormContext')

const setFormContext = (isSubmitted: boolean, message?: string) => ({
  formState: { isSubmitted, errors: message ? { name: { message } } : {} },
  register: jest.fn((name: string, options: RegisterOptions) => ({
    name,
    onBlur: options.onBlur,
    onChange: options.onChange,
  })),
  setFocus,
})

beforeEach(() => useFormContext.mockReturnValue(setFormContext(false)))

const handleChange = jest.fn()
const handleBlur = jest.fn()

const NameInput = ({ needFocus }: { needFocus: boolean }) => {
  const methods = useForm<{ name: string }>()

  return (
    <FormProvider {...methods}>
      <TextInput
        name="name"
        onChange={handleChange}
        onBlur={handleBlur}
        needFocus={needFocus}
        className="red"
      />
    </FormProvider>
  )
}

const factory = (needFocus: boolean = false) => {
  render(<NameInput needFocus={needFocus} />)
}

describe('Input', () => {
  it('should use the given name', () => {
    factory()
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('id', 'name')
    expect(input).toHaveAttribute('name', 'name')
  })

  it('should use the given className', () => {
    factory()
    expect(screen.getByRole('textbox')).toHaveClass('red')
  })

  it('should use the given onChange handler', () => {
    factory()
    userEvent.type(screen.getByRole('textbox'), 'John Doe')
    expect(handleChange).toHaveBeenCalled()
  })

  it('should use the given onBlur handler', () => {
    factory()
    screen.getByRole('textbox').focus()
    userEvent.tab()
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('should have the focus if "needFocus" is defined', () => {
    factory(true)
    expect(setFocus).toHaveBeenCalledWith('name')
    expect(setFocus).toHaveBeenCalledTimes(1)
  })

  it('should not have the focus if "needFocus" is undefined', () => {
    factory()
    expect(screen.getByRole('textbox')).not.toHaveFocus()
  })

  it('should have class "is-invalid" if the form is submitted and there is an error', () => {
    useFormContext.mockReturnValueOnce(setFormContext(true, 'An error'))
    factory()
    expect(screen.getByRole('textbox')).toHaveClass('is-invalid')
  })

  it('should have class "is-valid" if the form is submitted and there is no error', () => {
    useFormContext.mockReturnValueOnce(setFormContext(true))
    factory()
    expect(screen.getByRole('textbox')).toHaveClass('is-valid')
  })

  it('should not have class "is-invalid" nor "is-valid" if the form is not submitted', () => {
    factory()
    const input = screen.getByRole('textbox')
    expect(input).not.toHaveClass('is-invalid')
    expect(input).not.toHaveClass('is-valid')
  })
})
