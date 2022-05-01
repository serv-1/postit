import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Authentication from '../../pages/authentication'

jest.mock('../../components/AuthenticationForgotPassword', () => ({
  __esModule: true,
  default: (props: {
    setForgotPassword: React.Dispatch<React.SetStateAction<boolean>>
  }) => (
    <button onClick={() => props.setForgotPassword(true)}>
      Forgot password
    </button>
  ),
}))

jest.mock('../../components/AuthenticationSignInForm', () => ({
  __esModule: true,
  default: (props: {
    setForgotPassword: React.Dispatch<React.SetStateAction<boolean>>
  }) => <button onClick={() => props.setForgotPassword(false)}>Back</button>,
}))

it('renders the "Forgot password" button and the "Back" button', async () => {
  render(<Authentication providers={null} />)

  let forgotPwBtn = screen.getByRole('button')
  await userEvent.click(forgotPwBtn)

  const backBtn = screen.getByRole('button')
  expect(backBtn).toBeInTheDocument()
  await userEvent.click(backBtn)

  forgotPwBtn = screen.getByRole('button')
  expect(forgotPwBtn).toBeInTheDocument()
})
