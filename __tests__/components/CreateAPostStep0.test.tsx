import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateAPostStep0 from '../../components/CreateAPostStep0'

it('has the "hidden" class if the given step isn\'t the current step', async () => {
  render(
    <CreateAPostStep0 step={1} setStep={() => null} setLatLon={() => null} />
  )

  await screen.findByTestId('leaflet-map')
  await screen.findByTestId('mapFlyToLatLon')
  await screen.findByTestId('mapInvalidateSize')

  const container = screen.getByTestId('step0')
  expect(container).toHaveClass('hidden')
})

test('the modal displays and hides', async () => {
  render(
    <CreateAPostStep0 step={0} setStep={() => null} setLatLon={() => null} />
  )

  await screen.findByTestId('leaflet-map')
  await screen.findByTestId('mapFlyToLatLon')
  await screen.findByTestId('mapInvalidateSize')

  const openBtn = screen.getByRole('button', { name: /open/i })
  await userEvent.click(openBtn)

  const modal = screen.getByRole('dialog')
  expect(modal).not.toHaveClass('hidden')

  const closeBtn = screen.getByRole('button', { name: /close/i })
  await userEvent.click(closeBtn)
  expect(modal).toHaveClass('hidden')
})

test('the "Next" button is disabled when the user don\'t specify an address', async () => {
  render(
    <CreateAPostStep0 step={0} setStep={() => null} setLatLon={() => null} />
  )

  await screen.findByTestId('leaflet-map')
  await screen.findByTestId('mapFlyToLatLon')
  await screen.findByTestId('mapInvalidateSize')

  const nextBtn = screen.getByRole('button', { name: /next/i })
  expect(nextBtn).toBeDisabled()
})

test('the "Next" button passes to the next step', async () => {
  const setStep = jest.fn()
  render(
    <CreateAPostStep0
      step={0}
      setStep={setStep}
      latLon={[10, 20]}
      setLatLon={() => null}
    />
  )

  await screen.findByTestId('leaflet-map')
  await screen.findByTestId('mapFlyToLatLon')
  await screen.findByTestId('mapInvalidateSize')

  const nextBtn = screen.getByRole('button', { name: /next/i })
  await userEvent.click(nextBtn)

  expect(setStep).toHaveBeenNthCalledWith(1, 1)
})
