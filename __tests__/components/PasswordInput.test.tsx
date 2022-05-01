import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChangeEvent } from 'react'
import PasswordInput from '../../components/PasswordInput'

const setFocus = jest.fn()
const useFormContext = jest.spyOn(require('react-hook-form'), 'useFormContext')

beforeEach(() =>
  useFormContext.mockReturnValue({
    setFocus,
    formState: {},
    register: (
      x: string,
      { onChange }: { onChange: (e: ChangeEvent<HTMLElement>) => void }
    ) => ({ onChange }),
  })
)

it('renders', async () => {
  const onChange = jest.fn()
  render(
    <>
      <label htmlFor="password">Password</label>
      <PasswordInput
        className="red"
        containerClass="blue"
        onChange={onChange}
      />
    </>
  )

  const input = screen.getByLabelText(/^password/i)
  expect(input).toHaveAttribute('type', 'password')
  expect(input).toHaveClass('red')
  expect(setFocus).not.toHaveBeenCalled()

  await userEvent.type(input, 'a')
  expect(onChange).toHaveBeenCalledTimes(1)

  const container = screen.getByTestId('container')
  expect(container).toHaveClass('blue')

  const showHideBtn = screen.getByRole('button')
  expect(showHideBtn).toHaveAccessibleName(/show/i)

  const openEyeIcon = screen.getByTestId('openEye')
  expect(openEyeIcon).toBeInTheDocument()
})

it('has the focus', () => {
  render(
    <>
      <label htmlFor="password">Password</label>
      <PasswordInput needFocus />
    </>
  )

  expect(setFocus).toHaveBeenCalledTimes(1)
})

test('the password shows/hides', async () => {
  render(
    <>
      <label htmlFor="password">Password</label>
      <PasswordInput />
    </>
  )

  const showHideBtn = screen.getByRole('button')
  const input = screen.getByLabelText(/^password/i)

  await userEvent.click(showHideBtn)
  expect(input).toHaveAttribute('type', 'text')
  expect(showHideBtn).toHaveAccessibleName(/hide/i)

  const closeEyeIcon = screen.getByTestId('closeEye')
  expect(closeEyeIcon).toBeInTheDocument()

  await userEvent.click(showHideBtn)
  expect(input).toHaveAttribute('type', 'password')
  expect(showHideBtn).toHaveAccessibleName(/show/i)

  const openEyeIcon = screen.getByTestId('openEye')
  expect(openEyeIcon).toBeInTheDocument()
})
