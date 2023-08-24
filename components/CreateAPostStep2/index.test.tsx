import CreateAPostStep2 from '.'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('components/Input', () => ({
  __esModule: true,
  default: () => <input type="text" />,
}))
jest.mock('components/InputError', () => ({
  __esModule: true,
  default: () => <div></div>,
}))
jest.mock('components/Select', () => ({
  __esModule: true,
  default: () => <select></select>,
}))
jest.mock('components/TextArea', () => ({
  __esModule: true,
  default: () => <textarea></textarea>,
}))

it('has the "hidden" class if the given step isn\'t its step', () => {
  render(<CreateAPostStep2 step={0} setStep={() => null} />)

  const container = screen.getByTestId('step2')
  expect(container).toHaveClass('hidden')
})

test('the "Back" button passes to the previous step', async () => {
  const setStep = jest.fn()
  render(<CreateAPostStep2 step={2} setStep={setStep} />)

  const backBtn = screen.getByRole('button', { name: /back/i })
  await userEvent.click(backBtn)
  expect(setStep).toHaveBeenNthCalledWith(1, 1)
})
