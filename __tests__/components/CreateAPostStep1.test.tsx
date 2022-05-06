import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateAPostStep1 from '../../components/CreateAPostStep1'

test('the "Next" button passes to the next step', async () => {
  const setStep = jest.fn()
  render(<CreateAPostStep1 setStep={setStep} />)

  const nextBtn = screen.getByRole('button')
  await userEvent.click(nextBtn)

  expect(setStep).toHaveBeenNthCalledWith(1, 1)
})
