'use client'

import MapFullScreenButton from 'components/MapFullScreenButton'
import type { Map as LeafletMap } from 'leaflet'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'

export interface MapProps {
  renderContent?: (map: LeafletMap) => React.ReactNode
  className?: string
  zoom: number
  center?: [number, number]
  showZoomBtn?: boolean
  showFullScreenBtn?: boolean
}

export default function Map({
  renderContent,
  className,
  zoom,
  center,
  showZoomBtn,
  showFullScreenBtn,
}: MapProps) {
  const [fullScreen, setFullScreen] = useState(false)

  return (
    <div
      className={
        fullScreen
          ? 'absolute top-0 left-0 z-[9999] w-screen h-screen'
          : className
      }
    >
      <MapContainer
        className="w-full h-full"
        center={center || [37.777, -122.42]}
        zoom={zoom}
        scrollWheelZoom
        zoomControl={showZoomBtn}
      >
        <MapResize />
        {showFullScreenBtn && (
          <MapFullScreenButton
            fullScreen={fullScreen}
            setFullScreen={setFullScreen}
          />
        )}
        {renderContent && <MapContent renderContent={renderContent} />}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  )
}

function MapResize() {
  const map = useMap()

  useEffect(() => {
    map.invalidateSize()
  })

  return null
}

interface MapContentProps {
  renderContent: (map: LeafletMap) => React.ReactNode
}

function MapContent({ renderContent }: MapContentProps) {
  const map = useMap()

  return renderContent(map)
}
