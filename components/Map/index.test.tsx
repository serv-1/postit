import { render, screen } from '@testing-library/react'
import Map from '.'
import type { MapContainerProps } from 'react-leaflet'
import userEvent from '@testing-library/user-event'

const mockInvalidateSize = jest.fn()

jest.mock('react-leaflet', () => ({
  MapContainer: ({
    children,
    center,
    zoom,
    zoomControl,
  }: MapContainerProps) => (
    <div
      data-testid="map"
      data-center={center}
      data-zoom={zoom}
      data-zoomcontrol={zoomControl}
    >
      {children}
    </div>
  ),
  TileLayer: () => <div></div>,
  useMap: () => ({ invalidateSize: mockInvalidateSize }),
}))

it('renders correctly', () => {
  render(
    <Map className="mapContainer" zoom={10} renderContent={() => 'Content'} />
  )

  const map = screen.getByTestId('map')

  expect(map).toHaveAttribute('data-center', '37.777,-122.42')
  expect(map).toHaveAttribute('data-zoom', '10')
  expect(map).not.toHaveAttribute('data-zoomcontrol')
  expect(map).toHaveTextContent('Content')

  const container = map.parentElement

  expect(container).toHaveClass('mapContainer')

  const fullScreenBtn = screen.queryByRole('button', { name: /full screen/i })

  expect(fullScreenBtn).not.toBeInTheDocument()
  expect(mockInvalidateSize).toHaveBeenCalledTimes(1)
})

it('renders the zoom control', () => {
  render(<Map zoom={0} showZoomBtn />)

  const map = screen.getByTestId('map')

  expect(map).toHaveAttribute('data-zoomcontrol')
})

it('renders the full screen button', () => {
  render(<Map zoom={0} showFullScreenBtn />)

  const fullScreenBtn = screen.getByRole('button')

  expect(fullScreenBtn).toHaveAccessibleName(/full screen/i)
})

it('renders in full screen on click on the full screen button', async () => {
  render(<Map zoom={0} showFullScreenBtn />)

  const fullScreenBtn = screen.getByRole('button')

  await userEvent.click(fullScreenBtn)

  const container = screen.getByTestId('map').parentElement

  expect(container).toHaveClass('absolute')
})

it('minimizes after a second click on the full screen button', async () => {
  render(<Map zoom={0} showFullScreenBtn />)

  const fullScreenBtn = screen.getByRole('button', { name: /full screen/i })

  await userEvent.click(fullScreenBtn)
  await userEvent.click(fullScreenBtn)

  const container = screen.getByTestId('map').parentElement

  expect(container).not.toHaveClass('absolute')
})

it('renders centered on the given latitude and longitude', () => {
  render(<Map center={[1, 2]} zoom={0} />)

  const map = screen.getByTestId('map')

  expect(map).toHaveAttribute('data-center', '1,2')
})

it('resizes after every render', async () => {
  render(<Map zoom={0} showFullScreenBtn />)

  const fullScreenBtn = screen.getByRole('button', { name: /full screen/i })

  await userEvent.click(fullScreenBtn)
  await userEvent.click(fullScreenBtn)

  expect(mockInvalidateSize).toHaveBeenCalledTimes(3)
})
