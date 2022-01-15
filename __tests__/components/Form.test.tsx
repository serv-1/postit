import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BaseSyntheticEvent } from 'react'
import { SubmitHandler, UseFormReturn } from 'react-hook-form'
import Form from '../../components/Form'

const submitHandler = jest.fn()

const submitHandlers = {
  submitHandler: (e: BaseSyntheticEvent) => {
    e.preventDefault()
    submitHandler()
  },
} as unknown as { submitHandler: SubmitHandler<{}> }

const methods = {
  handleSubmit: (fn: () => void) => fn,
} as unknown as UseFormReturn

const Page = ({ csrfToken }: { csrfToken?: string }) => {
  return (
    <Form
      name="register"
      method="post"
      submitHandlers={submitHandlers}
      methods={methods}
      csrfToken={csrfToken}
    >
      <input type="submit" />
    </Form>
  )
}

const factory = (csrfToken?: string) => {
  render(<Page csrfToken={csrfToken} />)
}

describe('Form', () => {
  it("should render it's children", () => {
    factory()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should use the given name', () => {
    factory()
    const form = screen.getByRole('form')
    expect(form).toHaveAttribute('name', 'register')
    expect(form).toHaveAttribute('id', 'register')
  })

  it('should use the given method', () => {
    factory()
    expect(screen.getByRole('form')).toHaveAttribute('method', 'post')
  })

  it('should use the given "submitHandler"', () => {
    factory()
    userEvent.click(screen.getByRole('button'))
    expect(submitHandler).toHaveBeenCalledTimes(1)
  })

  it('should render the csrf token input if "csrfToken" is defined', () => {
    factory('csrfToken')
    expect(screen.getByDisplayValue('csrfToken')).toBeInTheDocument()
  })

  it('should not render the csrf token input if "csrfToken" is undefined', () => {
    factory()
    expect(screen.queryByDisplayValue('csrfToken')).not.toBeInTheDocument()
  })
})
