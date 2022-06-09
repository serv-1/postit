import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateAPostStep0 from '../../components/CreateAPostStep0'

const useFormContext = jest.spyOn(require('react-hook-form'), 'useFormContext')
const useWatch = jest.spyOn(require('react-hook-form'), 'useWatch')

beforeEach(() => {
  useFormContext.mockReturnValue({ setValue: () => null, register: () => null })
  useWatch.mockReturnValue(null)
})

it('has the "hidden" class if the given step isn\'t the current step', async () => {
  render(<CreateAPostStep0 step={1} setStep={() => null} />)

  await screen.findByTestId('leaflet-map')
  await screen.findByTestId('mapFlyToLatLon')
  await screen.findByTestId('mapInvalidateSize')

  const container = screen.getByTestId('step0')
  expect(container).toHaveClass('hidden')
})

test('the "Next" button is disabled when the user don\'t specify an address', async () => {
  render(<CreateAPostStep0 step={0} setStep={() => null} />)

  await screen.findByTestId('leaflet-map')
  await screen.findByTestId('mapFlyToLatLon')
  await screen.findByTestId('mapInvalidateSize')

  const nextBtn = screen.getByRole('button', { name: /next/i })
  expect(nextBtn).toBeDisabled()
})

test('the "Next" button passes to the next step', async () => {
  useWatch.mockReturnValue('Oslo, Norway')
  const setStep = jest.fn()

  render(<CreateAPostStep0 step={0} setStep={setStep} />)

  await screen.findByTestId('leaflet-map')
  await screen.findByTestId('mapFlyToLatLon')
  await screen.findByTestId('mapInvalidateSize')

  const nextBtn = screen.getByRole('button', { name: /next/i })
  await userEvent.click(nextBtn)

  expect(setStep).toHaveBeenNthCalledWith(1, 1)
})
