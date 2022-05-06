import CreateAPostStep3 from '../../components/CreateAPostStep3'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('../../components/Input', () => ({
  __esModule: true,
  default: () => <input />,
}))

jest.mock('../../components/InputError', () => ({
  __esModule: true,
  default: () => <div></div>,
}))

jest.mock('../../components/Select', () => ({
  __esModule: true,
  default: () => <select></select>,
}))

jest.mock('../../components/TextArea', () => ({
  __esModule: true,
  default: () => <textarea></textarea>,
}))

test('the "Back" button passes to the previous step', async () => {
  const setStep = jest.fn()
  render(<CreateAPostStep3 setStep={setStep} />)

  const backBtn = screen.getByRole('button', { name: /back/i })
  await userEvent.click(backBtn)
  expect(setStep).toHaveBeenNthCalledWith(1, 1)
})
