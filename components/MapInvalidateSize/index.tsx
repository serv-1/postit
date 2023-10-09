import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface MapInvalidateSizeProps {
  resize?: boolean
}

export default function MapInvalidateSize({ resize }: MapInvalidateSizeProps) {
  const map = useMap()

  useEffect(() => {
    if (resize) map.invalidateSize()
  }, [resize, map])

  return null
}
