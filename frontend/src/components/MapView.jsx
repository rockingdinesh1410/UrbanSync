import React from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { imageUrl } from '../api'

const createCustomPin = (status = 'SUBMITTED', priority = 'MEDIUM') => {
  let color = '#8B1E1E' // Default Tamil Nadu maroon
  if (status === 'RESOLVED') color = '#1E7E52' // Green
  else if (status === 'IN_PROGRESS') color = '#D4881A' // Gold/Amber
  else if (status === 'ACKNOWLEDGED') color = '#B84A2A' // Terracotta
  else if (status === 'REJECTED') color = '#991B1B' // Red

  if (priority === 'CRITICAL' && status !== 'RESOLVED') {
    color = '#DC2626'
  }

  return L.divIcon({
    className: 'ct-pin-wrap',
    html: `<div class="ct-pin" style="background:${color}; box-shadow: 0 2px 8px ${color}88"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })
}

function ClickCapture({ onPick }) {
  useMapEvents({
    click(e) {
      onPick?.([e.latlng.lat, e.latlng.lng])
    }
  })
  return null
}

export default function MapView({ reports = [], position, onPick, selectable = false, zoom = 12 }) {
  // Center at Tamil Nadu / Chennai
  const center = position || [13.0827, 80.2707]

  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom className="map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {selectable && <ClickCapture onPick={onPick} />}
      {position && (
        <Marker position={position} icon={createCustomPin('IN_PROGRESS')}>
          <Popup>Selected Issue Location</Popup>
        </Marker>
      )}
      {reports.map((r) => (
        <Marker
          key={r.id}
          position={[r.latitude, r.longitude]}
          icon={createCustomPin(r.status, r.priority)}
        >
          <Popup>
            <div className="map-popup-card">
              <b>{r.title}</b>
              <div className="popup-sub">
                <span>{r.category?.replaceAll('_', ' ')}</span> · <span>{r.district || 'Tamil Nadu'}</span>
              </div>
              <div className="popup-status">
                Status: <b>{r.status}</b>
              </div>
              {r.upvotes > 0 && <small className="popup-upvotes">{r.upvotes} citizens supported</small>}
              {r.photoUrl && (
                <img
                  className="popup-thumb"
                  width="130"
                  src={imageUrl(r.photoUrl)}
                  alt={r.title}
                />
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
