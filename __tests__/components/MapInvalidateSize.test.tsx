import { render } from '@testing-library/react'
import MapInvalidateSize from '../../components/MapInvalidateSize'

jest.unmock('../../components/MapInvalidateSize')

const mockMap = { invalidateSize: jest.fn() }
jest.mock('react-leaflet', () => ({ __esModule: true, useMap: () => mockMap }))

test("the map doesn't resize if it doesn't need to resize", () => {
  render(<MapInvalidateSize />)
  expect(mockMap.invalidateSize).not.toHaveBeenCalled()
})

test('the map camera fly to the given latitude/longitude', () => {
  render(<MapInvalidateSize resize />)
  expect(mockMap.invalidateSize).toHaveBeenCalledTimes(1)
})
