'use client'

import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Memory } from '@/types'

interface MemoryMapProps {
  memories: Memory[]
}

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function FitBounds({ memories }: { memories: Memory[] }) {
  const map = useMap()

  useEffect(() => {
    const points = memories
      .filter((memory) => typeof memory.latitude === 'number' && typeof memory.longitude === 'number')
      .map((memory) => [memory.latitude as number, memory.longitude as number] as [number, number])

    if (!points.length) return
    if (points.length === 1) {
      map.setView(points[0], 11)
      return
    }

    map.fitBounds(points, { padding: [30, 30] })
  }, [map, memories])

  return null
}

export default function MemoryMap({ memories }: MemoryMapProps) {
  const points = memories.filter((memory) => typeof memory.latitude === 'number' && typeof memory.longitude === 'number')

  return (
    <div className="w-full h-[420px] rounded-3xl overflow-hidden border border-outline-variant/20 shadow-ambient">
      <MapContainer center={[24.8607, 67.0011]} zoom={5} className="w-full h-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds memories={memories} />

        {points.map((memory) => (
          <Marker
            key={memory.id}
            position={[memory.latitude as number, memory.longitude as number]}
            icon={defaultIcon}
          >
            <Popup>
              <div className="w-40">
                <img src={memory.imagePath} alt={memory.title} className="w-full h-20 object-cover rounded-lg mb-2" />
                <p className="font-bold text-xs">{memory.title}</p>
                <p className="text-[11px] text-slate-600">{memory.location}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
