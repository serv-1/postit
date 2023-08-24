import PasswordStrength from '.'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const useFormContext = jest.spyOn(require('react-hook-form'), 'useFormContext')

it('renders', () => {
  useFormContext.mockReturnValue({ getValues: () => ({}) })

  render(
    <PasswordStrength className="red">
      {() => <input type="text" />}
    </PasswordStrength>
  )

  const strength = screen.getByRole('status')
  expect(strength).toHaveTextContent('weak')
  expect(strength).toHaveClass('red')

  const input = screen.getByRole('textbox')
  expect(input).toBeInTheDocument()
})

it("renders the appropriate strength and take into account the other fields' values", async () => {
  useFormContext.mockReturnValue({ getValues: () => ({ name: 'John Doe' }) })

  render(
    <PasswordStrength>
      {(onChange) => <input type="text" onChange={onChange} />}
    </PasswordStrength>
  )

  const strength = screen.getByRole('status')
  const input = screen.getByRole('textbox')

  await userEvent.type(input, 'english')
  expect(strength).toHaveTextContent('weak')

  await userEvent.clear(input)
  await userEvent.type(input, 'english rigole')
  expect(strength).toHaveTextContent('average')

  await userEvent.clear(input)
  await userEvent.type(input, 'english rigole tile')
  expect(strength).toHaveTextContent('strong')

  await userEvent.clear(input)
  await userEvent.type(input, 'John Doe') // value of another input
  expect(strength).toHaveTextContent('weak')
})
