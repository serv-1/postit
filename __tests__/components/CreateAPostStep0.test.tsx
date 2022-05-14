import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateAPostStep0 from '../../components/CreateAPostStep0'

it('has the "hidden" class if the given step isn\'t its step', () => {
  render(<CreateAPostStep0 step={1} setStep={() => null} />)

  const container = screen.getByTestId('step0')
  expect(container).toHaveClass('hidden')
})

test('the "Next" button passes to the next step', async () => {
  const setStep = jest.fn()
  render(<CreateAPostStep0 step={0} setStep={setStep} />)

  const nextBtn = screen.getByRole('button')
  await userEvent.click(nextBtn)

  expect(setStep).toHaveBeenNthCalledWith(1, 1)
})
