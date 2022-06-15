import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostPageMap from '../../components/PostPageMap'
import server from '../../mocks/server'

const useToast = jest.spyOn(require('../../contexts/toast'), 'useToast')
const setToast = jest.fn()

beforeEach(() => {
  window.scrollTo = () => undefined
  useToast.mockReturnValue({ setToast })
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
