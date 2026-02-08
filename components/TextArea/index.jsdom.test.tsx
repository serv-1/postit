import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { RegisterOptions, UseFormReturn } from 'react-hook-form'
import TextArea from '.'
import { useFormContext } from 'react-hook-form'

vi.mock('react-hook-form', () => ({
  useFormContext: vi.fn(),
}))

const setFocus = vi.fn()
const mockUseFormContext = vi.mocked(useFormContext)

const setFormContext = (isSubmitted: boolean, message?: string) =>
  ({
    formState: { isSubmitted, errors: message ? { test: { message } } : {} },
    register: vi.fn((name: string, opt: RegisterOptions) => ({
      name,
      onChange: opt?.onChange,
    })),
    setFocus,
  }) as unknown as UseFormReturn

beforeEach(() => mockUseFormContext.mockReturnValue(setFormContext(false)))

it('renders', async () => {
  const onChange = vi.fn()

  render(<TextArea name="test" registerOptions={{ onChange }} required />)

  const textarea = screen.getByRole('textbox')
  expect(textarea).toHaveAttribute('name', 'test')
  expect(textarea).toHaveAttribute('id', 'test')
  expect(textarea).toHaveAttribute('aria-describedby', 'testFeedback')
  expect(textarea).toBeRequired()

  await userEvent.type(textarea, 'a')
  expect(onChange).toHaveBeenCalledTimes(1)

  expect(setFocus).not.toHaveBeenCalled()
})

it('has the focus', () => {
  render(<TextArea name="test" needFocus />)
  expect(setFocus).toHaveBeenNthCalledWith(1, 'test')
})

it('has a red border if the form is submitted and there is an error', () => {
  mockUseFormContext.mockReturnValue(setFormContext(true, 'error'))
  render(<TextArea name="test" />)
  const textarea = screen.getByRole('textbox')
  expect(textarea).toHaveClass(/rose/)
})

it("hasn't a red border if the form is submitted and there is no error", () => {
  mockUseFormContext.mockReturnValue(setFormContext(true))
  render(<TextArea name="test" />)
  const textarea = screen.getByRole('textbox')
  expect(textarea).not.toHaveClass(/rose/)
})
