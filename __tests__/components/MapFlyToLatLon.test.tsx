import { render } from '@testing-library/react'
import MapFlyToLatLon from '../../components/MapFlyToLatLon'

jest.unmock('../../components/MapFlyToLatLon')

const mockMap = { flyTo: jest.fn() }
jest.mock('react-leaflet', () => ({ __esModule: true, useMap: () => mockMap }))

test("the map camera doesn't move if there is no latitude/longitude to fly to", () => {
  render(<MapFlyToLatLon />)
  expect(mockMap.flyTo).not.toHaveBeenCalled()
})

test('the map camera fly to the given latitude/longitude', () => {
  render(<MapFlyToLatLon latLon={[10, 20]} />)
  expect(mockMap.flyTo).toHaveBeenNthCalledWith(1, [10, 20])
})
