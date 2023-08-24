import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface MapFlyToLatLonProps {
  latLon?: [number, number]
}

export default function MapFlyToLatLon({ latLon }: MapFlyToLatLonProps) {
  const map = useMap()

  useEffect(() => {
    if (latLon) map.flyTo(latLon)
  }, [latLon, map])

  return null
}
