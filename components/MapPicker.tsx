'use client'

import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapPickerProps {
  latitude: number | null
  longitude: number | null
  onPick: (lat: number, lng: number) => void
}

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function PickerMarker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })

  return null
}

export default function MapPicker({ latitude, longitude, onPick }: MapPickerProps) {
  const center: [number, number] =
    typeof latitude === 'number' && typeof longitude === 'number'
      ? [latitude, longitude]
      : [24.8607, 67.0011]

  return (
    <div className="w-full h-48 rounded-2xl overflow-hidden border border-outline-variant/20">
      <MapContainer center={center} zoom={5} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <PickerMarker onPick={onPick} />
        {typeof latitude === 'number' && typeof longitude === 'number' && (
          <Marker position={[latitude, longitude]} icon={markerIcon} />
        )}
      </MapContainer>
    </div>
  )
}
