import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostLocationModal from '../../components/PostLocationModal'

jest.mock('react-hook-form', () => ({
  __esModule: true,
  useFormContext: () => ({ setValue: () => null, register: () => null }),
}))

test('the modal displays and hides', async () => {
  render(<PostLocationModal />)

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
