import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface MapInvalidateSizeProps {
  resize?: boolean
}

export default function MapInvalidateSize({ resize }: MapInvalidateSizeProps) {
  const { invalidateSize } = useMap()

  useEffect(() => {
    if (resize) invalidateSize()
  }, [resize, invalidateSize])

  return null
}
