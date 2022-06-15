import { MapContainer, TileLayer } from 'react-leaflet'

interface MapProps {
  children?: React.ReactNode
  className?: string
  zoom: number
  center?: [number, number]
}

const Map = ({ children, className, zoom, center }: MapProps) => {
  return (
    <div data-testid="leaflet-map">
      <MapContainer
        className={className}
        center={center || [37.777, -122.42]}
        zoom={zoom}
        scrollWheelZoom={true}
      >
        {children}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  )
}

export default Map
