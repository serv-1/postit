import Signup from '../pages/signup'
import { screen, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Sign up form', () => {
  describe('Email', () => {
    it('should show an error message if it is invalid', async () => {
      render(<Signup />)
      userEvent.type(screen.getByLabelText(/email/i), 'bad email')
      userEvent.click(screen.getByRole('button'))
      expect((await screen.findAllByRole('alert'))[0]).toBeInTheDocument()
    })

    it('should show an error message if it is empty', async () => {
      render(<Signup />)
      userEvent.click(screen.getByRole('button'))
      expect((await screen.findAllByRole('alert'))[0]).toBeInTheDocument()
    })

    it('should not have className `is-valid` at the first render', () => {
      render(<Signup />)
      expect(screen.getByLabelText(/email/i)).not.toHaveClass('is-valid')
    })

    it('should have className `is-invalid` if it is invalid', async () => {
      render(<Signup />)
      userEvent.click(screen.getByRole('button'))
      expect(await screen.findByLabelText(/email/i)).toHaveClass('is-invalid')
    })

    it('should have className `is-valid` if it is not invalid anymore', async () => {
      render(<Signup />)
      userEvent.click(screen.getByRole('button'))
      userEvent.type(await screen.findByLabelText(/email/i), 'example@test.com')
      expect(await screen.findByLabelText(/email/i)).toHaveClass('is-valid')
    })

    it('should not show the error message if it is not invalid anymore', async () => {
      render(<Signup />)
      userEvent.click(screen.getByRole('button'))
      userEvent.type(await screen.findByLabelText(/email/i), 'example@test.com')
      expect((await screen.findByRole('alert')).textContent).not.toContain(
        'email'
      )
    })
  })

  describe('Password', () => {
    it('should show an error message if it is smaller than 10 chars.', async () => {
      render(<Signup />)
      userEvent.type(screen.getByLabelText(/^password/i), 'azerty')
      userEvent.click(screen.getByRole('button'))
      expect((await screen.findAllByRole('alert'))[1]).toBeInTheDocument()
    })

    it('should show an error message if it is greater than 20 chars.', async () => {
      render(<Signup />)
      userEvent.type(
        screen.getByLabelText(/^password/i),
        'azerty123456qwerty123456'
      )
      userEvent.click(screen.getByRole('button'))
      expect((await screen.findAllByRole('alert'))[1]).toBeInTheDocument()
    })

    it('should show an error message if it is equal to the email', async () => {
      render(<Signup />)
      userEvent.type(screen.getByLabelText(/email/i), 'example@test.com')
      userEvent.type(screen.getByLabelText(/^password/i), 'example@test.com')
      userEvent.click(screen.getByRole('button'))
      expect((await screen.findAllByRole('alert'))[0]).toBeInTheDocument()
    })

    it('should show an error message if it is empty', async () => {
      render(<Signup />)
      userEvent.click(screen.getByRole('button'))
      expect((await screen.findAllByRole('alert'))[1]).toBeInTheDocument()
    })

    it('should not have className `is-valid` at the first render', () => {
      render(<Signup />)
      expect(screen.getByLabelText(/^password/i)).not.toHaveClass('is-valid')
    })

    it('should have className `is-invalid` if it is invalid', async () => {
      render(<Signup />)
      userEvent.click(screen.getByRole('button'))
      expect(await screen.findByLabelText(/^password/i)).toHaveClass(
        'is-invalid'
      )
    })

    it('should have className `is-valid` if it is not invalid anymore', async () => {
      render(<Signup />)
      userEvent.click(screen.getByRole('button'))
      userEvent.type(await screen.findByLabelText(/^password/i), '0123456789')
      expect(await screen.findByLabelText(/^password/i)).toHaveClass('is-valid')
    })

    it('should not show the error message if it is not invalid anymore', async () => {
      render(<Signup />)
      userEvent.click(screen.getByRole('button'))
      userEvent.type(await screen.findByLabelText(/^password/i), '0123456789')
      expect((await screen.findByRole('alert')).textContent).not.toContain(
        'password'
      )
    })
  })

  describe('Confirm your password', () => {
    const labelText = /confirm your password/i

    it('should show an error message if it is not equal to the password', async () => {
      render(<Signup />)
      userEvent.type(screen.getByLabelText(/^password/i), '0123456789')
      userEvent.type(screen.getByLabelText(labelText), '012')
      userEvent.click(screen.getByRole('button'))
      expect((await screen.findAllByRole('alert'))[1]).toBeInTheDocument()
    })

    it('should not have className `is-valid` at the first render', () => {
      render(<Signup />)
      expect(screen.getByLabelText(labelText)).not.toHaveClass('is-valid')
    })

    it('should have className `is-invalid` if it is invalid', async () => {
      render(<Signup />)
      userEvent.type(screen.getByLabelText(labelText), '123')
      userEvent.click(screen.getByRole('button'))
      expect(await screen.findByLabelText(labelText)).toHaveClass('is-invalid')
    })

    it('should have className `is-valid` if it is not invalid anymore', async () => {
      render(<Signup />)
      userEvent.type(screen.getByLabelText(/^password/i), '0123456789')
      userEvent.click(screen.getByRole('button'))
      userEvent.type(await screen.findByLabelText(labelText), '0123456789')
      expect(await screen.findByLabelText(labelText)).toHaveClass('is-valid')
    })

    it('should not show the error message if it is not invalid anymore', async () => {
      render(<Signup />)
      userEvent.type(screen.getByLabelText(/^password/i), '0123456789')
      userEvent.click(screen.getByRole('button'))
      userEvent.type(await screen.findByLabelText(labelText), '0123456789')
      expect((await screen.findByRole('alert')).textContent).not.toContain(
        'password'
      )
    })
  })
})
