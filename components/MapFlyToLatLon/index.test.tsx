import { render } from '@testing-library/react'
import MapFlyToLatLon from '.'

const mockFlyTo = jest.fn()

jest.mock('react-leaflet', () => ({
  useMap: () => ({ flyTo: mockFlyTo }),
}))

test("the map camera doesn't move if there is no latitude/longitude to fly to", () => {
  render(<MapFlyToLatLon />)
  expect(mockFlyTo).not.toHaveBeenCalled()
})

test('the map camera fly to the given latitude/longitude', () => {
  render(<MapFlyToLatLon latLon={[10, 20]} />)
  expect(mockFlyTo).toHaveBeenNthCalledWith(1, [10, 20])
})
