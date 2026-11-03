'use client'

import LoadingSpinner from 'components/LoadingSpinner'
import type { MapProps } from 'components/Map'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center">
      <LoadingSpinner />
    </div>
  ),
})

/*
 * This component only exist to resolve the error 'window is not defined'
 * triggered by react-leaflet.
 */

export default function MapWrapper(props: MapProps) {
  return <Map {...props} />
}
