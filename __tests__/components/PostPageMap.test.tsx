import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostPageMap from '../../components/PostPageMap'
import server from '../../mocks/server'
import { useToast } from '../../contexts/toast'

jest.mock('../../contexts/toast', () => ({
  useToast: jest.fn(),
}))

const useToastMock = useToast as jest.MockedFunction<typeof useToast>

const setToast = jest.fn()

beforeEach(() => {
  window.scrollTo = () => undefined
  useToastMock.mockReturnValue({ setToast, toast: {} })
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
