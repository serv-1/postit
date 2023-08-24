import { render } from '@testing-library/react'
import MapInvalidateSize from '.'

const mockInvalidateSize = jest.fn()

jest.mock('react-leaflet', () => ({
  useMap: () => ({ invalidateSize: mockInvalidateSize }),
}))

test("the map doesn't resize if it doesn't need to resize", () => {
  render(<MapInvalidateSize />)

  expect(mockInvalidateSize).not.toHaveBeenCalled()
})

test('the map camera fly to the given latitude/longitude', () => {
  render(<MapInvalidateSize resize />)

  expect(mockInvalidateSize).toHaveBeenCalledTimes(1)
})
