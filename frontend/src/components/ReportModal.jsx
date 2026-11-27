import React, { useState } from 'react'
import { X, MapPin, UploadCloud, LocateFixed, Send, AlertTriangle, User, Phone } from 'lucide-react'
import MapView from './MapView'
import { api } from '../api'

const categories = ['POTHOLE', 'GARBAGE', 'WATER_LEAK', 'STREETLIGHT', 'ROAD_DAMAGE', 'DRAINAGE', 'OTHER']
const districts = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Tirunelveli',
  'Erode',
  'Vellore',
  'Thanjavur',
  'Kanchipuram',
  'Tiruppur',
  'Dindigul',
  'Cuddalore',
  'Other District'
]

const districtCoordinates = {
  Chennai: [13.0827, 80.2707],
  Coimbatore: [11.0168, 76.9558],
  Madurai: [9.9252, 78.1198],
  Tiruchirappalli: [10.7905, 78.7047],
  Salem: [11.6643, 78.146],
  Tirunelveli: [8.7139, 77.7567],
  Erode: [11.341, 77.7172],
  Vellore: [12.9165, 79.1325],
  Thanjavur: [10.787, 79.1378],
  Kanchipuram: [12.8342, 79.7036],
  Tiruppur: [11.1085, 77.3411],
  Dindigul: [10.3673, 77.9803],
  Cuddalore: [11.748, 79.7714]
}

export default function ReportModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'POTHOLE',
    district: 'Chennai',
    priority: 'MEDIUM',
    citizenName: '',
    citizenPhone: ''
  })
  const [position, setPosition] = useState([13.0827, 80.2707])
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const change = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    if (name === 'district' && districtCoordinates[value]) {
      setPosition(districtCoordinates[value])
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const locate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setPosition([p.coords.latitude, p.coords.longitude]),
      () => setError('Location permission was denied. You can click on the map to pin your location.')
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v) data.append(k, v)
      })
      data.append('latitude', position[0])
      data.append('longitude', position[1])
      if (photo) data.append('photo', photo)

      await api.post('/reports', data)
      onCreated()
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Could not submit report. Please check your connection and try again.'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="modal report-modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">தமிழ்நாடு மக்கள் குரல் · CITIZEN GRIEVANCE</span>
            <h2>File a Public Civic Report</h2>
            <p>Directly submit issues to Greater Chennai Corporation and Tamil Nadu Municipal Authorities.</p>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="form-grid">
            <label>
              Issue Title *
              <input
                required
                name="title"
                value={form.title}
                onChange={change}
                placeholder="e.g. Deep pothole on Gandhi Road junction"
              />
            </label>

            <label>
              Issue Category *
              <select name="category" value={form.category} onChange={change}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label>
              Tamil Nadu District *
              <select name="district" value={form.district} onChange={change}>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Urgency / Priority
              <select name="priority" value={form.priority} onChange={change}>
                <option value="LOW">Low (Routine maintenance)</option>
                <option value="MEDIUM">Medium (Standard attention)</option>
                <option value="HIGH">High (Impacting traffic / hygiene)</option>
                <option value="CRITICAL">Critical (Hazard / Emergency)</option>
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label>
              Citizen / Reporter Name
              <div className="input-with-icon">
                <User size={15} />
                <input
                  name="citizenName"
                  value={form.citizenName}
                  onChange={change}
                  placeholder="Your full name"
                />
              </div>
            </label>

            <label>
              Contact Number (for SMS updates)
              <div className="input-with-icon">
                <Phone size={15} />
                <input
                  name="citizenPhone"
                  value={form.citizenPhone}
                  onChange={change}
                  placeholder="+91 98765 43210"
                />
              </div>
            </label>
          </div>

          <label>
            Detailed Description & Landmark *
            <textarea
              required
              name="description"
              value={form.description}
              onChange={change}
              rows="3"
              placeholder="Provide exact landmark, severity, time of notice, and impact on pedestrians or traffic..."
            />
          </label>

          <div className="map-label">
            <label>Pin Location on Tamil Nadu Map</label>
            <button type="button" className="small-outline" onClick={locate}>
              <LocateFixed size={14} /> Use My Current GPS
            </button>
          </div>

          <MapView position={position} onPick={setPosition} selectable zoom={13} />

          <div className="coords">
            <MapPin size={14} />
            <b>
              {position[0].toFixed(5)}, {position[1].toFixed(5)}
            </b>
            <span>(Click anywhere on the map above to move pin)</span>
          </div>

          <label className="upload-box">
            <UploadCloud size={24} />
            <div>
              <b>{photo ? photo.name : 'Upload Photographic Evidence (Optional)'}</b>
              <small>Accepts JPG, PNG, WEBP · Up to 8 MB</small>
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handlePhotoChange}
            />
          </label>

          {photoPreview && (
            <div className="photo-preview-box">
              <img src={photoPreview} alt="Preview" />
              <button
                type="button"
                className="remove-preview-btn"
                onClick={() => {
                  setPhoto(null)
                  setPhotoPreview(null)
                }}
              >
                Remove photo
              </button>
            </div>
          )}

          {error && (
            <div className="error-banner">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="primary-btn submit-btn" disabled={busy}>
            {busy ? (
              <span>Submitting report to municipal portal...</span>
            ) : (
              <>
                <Send size={16} />
                <span>Submit Grievance to Tamil Nadu Civic Authority</span>
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  )
}
