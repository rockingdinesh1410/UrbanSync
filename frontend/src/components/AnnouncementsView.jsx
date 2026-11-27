import React, { useState, useEffect } from 'react'
import { RadioTower, AlertTriangle, Info, Bell, Plus, Send, CheckCircle2, Building2, MapPin } from 'lucide-react'
import { api } from '../api'

export default function AnnouncementsView({ isAdmin, onAlertPublished }) {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDistrict, setSelectedDistrict] = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    content: '',
    district: 'All Tamil Nadu',
    department: 'Greater Chennai Corporation',
    urgency: 'INFO'
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements', {
        params: selectedDistrict !== 'ALL' ? { district: selectedDistrict } : {}
      })
      setAnnouncements(res.data)
    } catch (e) {
      setAnnouncements([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [selectedDistrict])

  const handleCreate = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      await api.post('/announcements', form)
      setSuccess('Civic broadcast published successfully to the public feed!')
      setForm({
        title: '',
        content: '',
        district: 'All Tamil Nadu',
        department: 'Greater Chennai Corporation',
        urgency: 'INFO'
      })
      setShowForm(false)
      fetchAnnouncements()
      if (onAlertPublished) onAlertPublished()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to publish broadcast. Check authorization.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="announcements-page">
      <div className="announcements-header-card">
        <div className="announcements-title-col">
          <div className="live-pulse-badge">
            <RadioTower size={16} />
            <span>TAMIL NADU OFFICIAL CIVIC BROADCASTS</span>
          </div>
          <h2>Public Alerts, Weather Advisories & Infrastructure Notices</h2>
          <p>
            Official bulletins issued by Greater Chennai Corporation, CMWSSB, TANGEDCO, and State Highways Department.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="primary-btn announce-new-btn"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={16} />
            <span>{showForm ? 'Close Form' : 'Broadcast Official Alert'}</span>
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="panel announcement-form-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">OFFICIAL BROADCAST DESK</span>
              <h2>Issue a State or District Alert</h2>
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}
          {success && <div className="success-banner">{success}</div>}

          <form onSubmit={handleCreate} className="broadcast-form">
            <div className="form-grid">
              <label>
                Alert Headline / Subject *
                <input
                  required
                  placeholder="e.g. Pre-Monsoon Canal Desilting & Traffic Advisory"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </label>

              <label>
                Issuing Department
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                >
                  <option value="Greater Chennai Corporation (GCC)">Greater Chennai Corporation (GCC)</option>
                  <option value="Chennai Metrowater & Sewerage (CMWSSB)">Chennai Metrowater & Sewerage (CMWSSB)</option>
                  <option value="TANGEDCO (Electricity Board)">TANGEDCO (Electricity Board)</option>
                  <option value="State Highways Department">State Highways Department</option>
                  <option value="Disaster Management & Civil Defense">Disaster Management & Civil Defense</option>
                  <option value="Municipal Administration Directorate">Municipal Administration Directorate</option>
                </select>
              </label>
            </div>

            <div className="form-grid">
              <label>
                Applicable District / Jurisdiction
                <select
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                >
                  <option value="All Tamil Nadu">All Tamil Nadu</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Coimbatore">Coimbatore</option>
                  <option value="Madurai">Madurai</option>
                  <option value="Tiruchirappalli">Tiruchirappalli</option>
                  <option value="Salem">Salem</option>
                  <option value="Tirunelveli">Tirunelveli</option>
                </select>
              </label>

              <label>
                Alert Urgency
                <select
                  value={form.urgency}
                  onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                >
                  <option value="INFO">Informational (General notice)</option>
                  <option value="WARNING">Warning (Maintenance / Water cut / Power shut)</option>
                  <option value="EMERGENCY">Emergency (Immediate civic action / Flood advisory)</option>
                </select>
              </label>
            </div>

            <label>
              Detailed Broadcast Message *
              <textarea
                required
                rows="3"
                placeholder="Details of operation, affected areas, helpline contacts, and safety instructions..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </label>

            <button type="submit" className="primary-btn submit-btn" disabled={busy}>
              <Send size={15} />
              <span>{busy ? 'Publishing broadcast...' : 'Publish State Civic Broadcast'}</span>
            </button>
          </form>
        </div>
      )}

      <div className="announcements-filter-bar">
        <span>Filter by Region:</span>
        {['ALL', 'All Tamil Nadu', 'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'].map((d) => (
          <button
            key={d}
            className={`filter-pill ${selectedDistrict === d ? 'active' : ''}`}
            onClick={() => setSelectedDistrict(d)}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="announcements-grid">
        {loading ? (
          <div className="loading-state">Loading official bulletins...</div>
        ) : announcements.length === 0 ? (
          <div className="empty-state">
            <Bell size={28} />
            <p>No active civic announcements for this filter.</p>
          </div>
        ) : (
          announcements.map((a) => (
            <article className={`announcement-card urgency-${a.urgency.toLowerCase()}`} key={a.id}>
              <div className="announcement-top">
                <span className={`urgency-badge urgency-${a.urgency.toLowerCase()}`}>
                  {a.urgency === 'EMERGENCY' ? <AlertTriangle size={13} /> : <Info size={13} />}
                  {a.urgency} NOTICE
                </span>
                <span className="announcement-date">
                  {new Date(a.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <h3>{a.title}</h3>
              <p>{a.content}</p>

              <div className="announcement-bottom">
                <span className="dept-tag">
                  <Building2 size={12} /> {a.department}
                </span>
                <span className="dist-tag">
                  <MapPin size={12} /> {a.district}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
