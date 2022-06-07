import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface MapInvalidateSizeProps {
  resize?: boolean
}

const MapInvalidateSize = ({ resize }: MapInvalidateSizeProps) => {
  const map = useMap()

  useEffect(() => {
    if (resize) map.invalidateSize()
  }, [resize, map])

  return null
}

export default MapInvalidateSize
