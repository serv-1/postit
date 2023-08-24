import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostPageMap from '.'
import server from 'mocks/server'

const mockSetToast = jest.fn()

jest
  .mock('contexts/toast', () => ({
    useToast: () => ({ setToast: mockSetToast, toast: {} }),
  }))
  .mock('components/MapInvalidateSize')

beforeEach(() => {
  window.scrollTo = () => undefined
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('renders', async () => {
  render(<PostPageMap address="Oslo, Norway" latLon={[59, 10]} />)

  await screen.findAllByTestId('leaflet-map')
  await screen.findByTestId('mapInvalidateSize')

  const address = screen.getByText('Oslo, Norway')
  expect(address).toBeInTheDocument()
})

it('displays/hides the modal', async () => {
  render(<PostPageMap address="Oslo, Norway" latLon={[59, 10]} />)

  await screen.findAllByTestId('leaflet-map')
  await screen.findByTestId('mapInvalidateSize')

  const fullScreenBtn = screen.getByRole('button', {
    name: /full screen/i,
  })
  await userEvent.click(fullScreenBtn)

  const modal = screen.getByRole('dialog')
  expect(modal).not.toHaveClass('hidden')

  const closeBtn = screen.getByRole('button', { name: /close/i })
  await userEvent.click(closeBtn)

  expect(modal).toHaveClass('hidden')
})
