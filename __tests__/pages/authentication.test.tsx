import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Authentication from '../../pages/authentication'

jest.mock('../../components/AuthenticationForgotPassword', () => ({
  __esModule: true,
  default: () => <h2>Forgot password</h2>,
}))

jest.mock('../../components/AuthenticationSignInForm', () => ({
  __esModule: true,
  default: () => <h2>Sign in</h2>,
}))

jest.mock('../../components/AuthenticationRegisterForm', () => ({
  __esModule: true,
  default: () => <h2>Register</h2>,
}))

test('switching between tabs render the related tab panel', async () => {
  render(<Authentication providers={null} />)

  const documentTitle = screen.getByTestId('documentTitle')
  expect(documentTitle).toHaveTextContent('Sign in')

  const signInTab = screen.getByRole('tab', { name: /sign in/i })
  expect(signInTab).toHaveAttribute('aria-selected', 'true')
  expect(signInTab).toHaveAttribute('aria-controls', 'sign-in-panel')
  expect(signInTab).toHaveAttribute('id', 'sign-in-tab')
  expect(signInTab).toHaveAttribute('tabindex', '0')
  expect(signInTab.className).toContain('border')

  const registerTab = screen.getByRole('tab', { name: /register/i })
  expect(registerTab).toHaveAttribute('aria-selected', 'false')
  expect(registerTab).toHaveAttribute('aria-controls', 'register-panel')
  expect(registerTab).toHaveAttribute('id', 'register-tab')
  expect(registerTab).toHaveAttribute('tabindex', '-1')
  expect(registerTab.className).not.toContain('border')

  const tabPanel = screen.getByRole('tabpanel')
  expect(tabPanel).toHaveAttribute('id', 'sign-in-panel')
  expect(tabPanel).toHaveAttribute('aria-labelledby', 'sign-in-tab')

  const signInTitle = screen.getByRole('heading', { name: /sign in/i })
  expect(signInTitle).toBeInTheDocument()

  await userEvent.click(registerTab)

  expect(documentTitle).toHaveTextContent('Register')

  expect(registerTab).toHaveAttribute('aria-selected', 'true')
  expect(registerTab).toHaveAttribute('tabindex', '0')
  expect(registerTab.className).toContain('border')

  expect(signInTab).toHaveAttribute('aria-selected', 'false')
  expect(signInTab).toHaveAttribute('tabindex', '-1')
  expect(signInTab.className).not.toContain('border')

  expect(tabPanel).toHaveAttribute('id', 'register-panel')
  expect(tabPanel).toHaveAttribute('aria-labelledby', 'register-tab')

  const registerTitle = screen.getByRole('heading', { name: /register/i })
  expect(registerTitle).toBeInTheDocument()
})

it('renders the tab panel related to the current hash in url', () => {
  Object.defineProperty(window, 'location', {
    get: () => ({ hash: '#forgot-password' }),
  })

  render(<Authentication providers={null} />)

  const documentTitle = screen.getByTestId('documentTitle')
  expect(documentTitle).toHaveTextContent('Forgot password')

  const forgotPasswordTitle = screen.getByRole('heading', {
    name: /forgot password/i,
  })
  expect(forgotPasswordTitle).toBeInTheDocument()
})

it('renders the default tab panel if the current hash in url is invalid', () => {
  Object.defineProperty(window, 'location', {
    get: () => ({ hash: '#ohNooo' }),
  })

  render(<Authentication providers={null} />)

  const documentTitle = screen.getByTestId('documentTitle')
  expect(documentTitle).toHaveTextContent('Sign in')

  const signInTitle = screen.getByRole('heading', { name: /sign in/i })
  expect(signInTitle).toBeInTheDocument()
})

test('we can use arrow left and arrow right to navigate between the tabs', async () => {
  render(<Authentication providers={null} />)

  const signInTab = screen.getByRole('tab', { name: /sign in/i })
  signInTab.focus()

  await userEvent.keyboard('{ArrowRight}')
  expect(signInTab).toHaveAttribute('tabindex', '-1')

  const registerTab = screen.getByRole('tab', { name: /register/i })
  expect(registerTab).toHaveAttribute('tabindex', '0')
  expect(registerTab).toHaveFocus()

  await userEvent.keyboard('{ArrowLeft}')
  expect(signInTab).toHaveAttribute('tabindex', '0')
  expect(signInTab).toHaveFocus()
  expect(registerTab).toHaveAttribute('tabindex', '-1')

  await userEvent.keyboard('{ArrowLeft}')
  expect(registerTab).toHaveAttribute('tabindex', '0')
  expect(registerTab).toHaveFocus()
  expect(signInTab).toHaveAttribute('tabindex', '-1')

  await userEvent.keyboard('{ArrowRight}')
  expect(signInTab).toHaveAttribute('tabindex', '0')
  expect(signInTab).toHaveFocus()
  expect(registerTab).toHaveAttribute('tabindex', '-1')
})
