import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterOptions } from 'react-hook-form'
import PasswordField from '../../components/PasswordField'

const useFormContext = jest.spyOn(require('react-hook-form'), 'useFormContext')
const useRouter = jest.spyOn(require('next/router'), 'useRouter')

const setFocus = jest.fn()

beforeEach(() => {
  useRouter.mockReturnValue({ pathname: '/' })
  useFormContext.mockReturnValue({
    register: jest.fn((name: string, opt: RegisterOptions) => ({
      onChange: opt.onChange,
    })),
    getValues: () => ({ name: 'John Doe', password: 'my password' }),
    formState: { isSubmitted: false, errors: {} },
    setFocus,
  })
})

interface FormFields {
  password: string
}

it('renders', () => {
  render(
    <PasswordField<FormFields>
      showForgotLink
      inputClass="red"
      containerClass="blue"
    />
  )

  const input = screen.getByLabelText(/^password$/i)
  expect(input).toHaveAttribute('type', 'password')
  expect(input).toHaveClass('red')
  expect(setFocus).not.toHaveBeenCalled()

  const inputContainer = screen.getByTestId('container')
  expect(inputContainer).toHaveClass('blue')

  const forgotLink = screen.getByRole('link')
  expect(forgotLink).toHaveAttribute('href', '/authentication#forgot-password')

  const strength = screen.queryByRole('status')
  expect(strength).not.toBeInTheDocument()

  const btn = screen.getByRole('button')
  expect(btn).toHaveAccessibleName(/show/i)

  const openEye = screen.getByTestId('openEye')
  expect(openEye).toBeInTheDocument()
})

test('the password input has the focus', () => {
  render(<PasswordField<FormFields> showForgotLink needFocus />)
  expect(setFocus).toHaveBeenCalledTimes(1)
})

test('the forgot password link dispatch the onHashChange event on the Authentication page on click', async () => {
  useRouter.mockReturnValue({ pathname: '/authentication' })

  const onHashChange = jest.fn()
  window.addEventListener('onHashChange', onHashChange)

  render(<PasswordField<FormFields> showForgotLink />)

  const forgotLink = screen.getByRole('link')
  await userEvent.click(forgotLink)

  expect(window.location.hash).toBe('#forgot-password')
  expect(onHashChange).toHaveBeenCalledTimes(1)

  window.removeEventListener('onHashChange', onHashChange)
})

test('the password shows/hides', async () => {
  render(<PasswordField<FormFields> showForgotLink />)

  const btn = screen.getByRole('button')

  await userEvent.click(btn)
  expect(btn).toHaveAccessibleName(/hide/i)

  const closeEye = screen.getByTestId('closeEye')
  expect(closeEye).toBeInTheDocument()

  const input = screen.getByLabelText(/^password$/i)
  expect(input).toHaveAttribute('type', 'text')
})

test("the password strength renders and take into account the other fields' values", async () => {
  render(<PasswordField<FormFields> showStrength />)

  const input = screen.getByLabelText(/^password$/i)
  const strength = screen.getByRole('status')

  await userEvent.type(input, 'english')
  expect(strength).toHaveTextContent('weak')

  await userEvent.clear(input)
  await userEvent.type(input, 'english rigole')
  expect(strength).toHaveTextContent('average')

  await userEvent.clear(input)
  await userEvent.type(input, 'english rigole tile')
  expect(strength).toHaveTextContent('strong')

  await userEvent.clear(input)
  await userEvent.type(input, 'John Doe') // value of another field
  expect(strength).toHaveTextContent('weak')
})
