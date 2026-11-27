import React, { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Filter,
  MapPin,
  Menu,
  Plus,
  RadioTower,
  ShieldCheck,
  BarChart3,
  Download,
  LogOut,
  ThumbsUp,
  Building2,
  Trash2,
  Save,
  Flame,
  Search,
  Check,
  AlertCircle
} from 'lucide-react'
import { api, clearAuthToken } from './api'
import MapView from './components/MapView'
import ReportCard from './components/ReportCard'
import ReportModal from './components/ReportModal'
import DetailModal from './components/DetailModal'
import AdminLogin from './components/AdminLogin'
import AnnouncementsView from './components/AnnouncementsView'
import AnalyticsView from './components/AnalyticsView'

const categories = ['ALL', 'POTHOLE', 'GARBAGE', 'WATER_LEAK', 'STREETLIGHT', 'ROAD_DAMAGE', 'DRAINAGE', 'OTHER']
const districts = [
  'ALL',
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Tirunelveli',
  'Erode',
  'Vellore',
  'Thanjavur',
  'Kanchipuram'
]

export default function App() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [districtFilter, setDistrictFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)

  // Admin state & edits
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('civictrack_admin_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [adminEdits, setAdminEdits] = useState({})
  const [adminSaveStatus, setAdminSaveStatus] = useState({})

  const refresh = async () => {
    try {
      const res = await api.get('/reports', {
        params: {
          category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
          district: districtFilter !== 'ALL' ? districtFilter : undefined
        }
      })
      setReports(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    const timer = setInterval(refresh, 20000)
    return () => clearInterval(timer)
  }, [categoryFilter, districtFilter])

  // Verify stored session on load
  useEffect(() => {
    const token = localStorage.getItem('civictrack_admin_token')
    if (token) {
      api.get('/auth/verify')
        .then((res) => {
          setAdminUser(res.data)
        })
        .catch(() => {
          clearAuthToken()
          setAdminUser(null)
        })
    }
  }, [])

  const stats = useMemo(
    () => ({
      total: reports.length,
      active: reports.filter((r) => !['RESOLVED', 'REJECTED'].includes(r.status)).length,
      resolved: reports.filter((r) => r.status === 'RESOLVED').length,
      progress: reports.filter((r) => r.status === 'IN_PROGRESS').length,
      emergency: reports.filter((r) => r.priority === 'CRITICAL' || r.priority === 'HIGH').length,
      totalUpvotes: reports.reduce((acc, curr) => acc + (curr.upvotes || 0), 0)
    }),
    [reports]
  )

  const visible = reports.filter((r) => {
    const matchCat = categoryFilter === 'ALL' || r.category === categoryFilter
    const matchDist = districtFilter === 'ALL' || r.district === districtFilter
    const text = `${r.title} ${r.description} ${r.category} ${r.district || ''}`.toLowerCase()
    return matchCat && matchDist && text.includes(search.toLowerCase())
  })

  const handleUpvote = async (id) => {
    try {
      const res = await api.post(`/reports/${id}/upvote`)
      setReports((prev) => prev.map((r) => (r.id === id ? res.data : r)))
    } catch (e) {
      console.error('Failed to upvote', e)
    }
  }

  const handleAdminFieldChange = (id, field, value) => {
    setAdminEdits((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value
      }
    }))
  }

  const handleSaveAdminUpdate = async (id) => {
    const edits = adminEdits[id] || {}
    const report = reports.find((r) => r.id === id)
    if (!report) return

    setAdminSaveStatus((prev) => ({ ...prev, [id]: 'saving' }))
    try {
      const payload = {
        status: edits.status || report.status,
        adminNote: edits.adminNote !== undefined ? edits.adminNote : (report.adminNote || ''),
        department: edits.department || report.department || 'GCC_CORPORATION',
        priority: edits.priority || report.priority || 'MEDIUM',
        estimatedDays: edits.estimatedDays !== undefined ? Number(edits.estimatedDays) : report.estimatedDays
      }

      const res = await api.patch(`/reports/${id}/status`, payload)
      setReports((prev) => prev.map((r) => (r.id === id ? res.data : r)))
      setAdminSaveStatus((prev) => ({ ...prev, [id]: 'success' }))
      setTimeout(() => {
        setAdminSaveStatus((prev) => ({ ...prev, [id]: null }))
      }, 2500)
    } catch (e) {
      alert(e.response?.data?.error || 'Could not update report status. Ensure officer session is valid.')
      setAdminSaveStatus((prev) => ({ ...prev, [id]: 'error' }))
    }
  }

  const handleDeleteReport = async (id) => {
    if (!window.confirm(`Are you sure you want to delete report TN-CT-${String(id).padStart(5, '0')}?`)) return
    try {
      await api.delete(`/reports/${id}`)
      setReports((prev) => prev.filter((r) => r.id !== id))
    } catch (e) {
      alert(e.response?.data?.error || 'Could not delete report.')
    }
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (e) {
      console.error(e)
    } finally {
      clearAuthToken()
      setAdminUser(null)
    }
  }

  const exportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Status', 'Priority', 'District', 'Department', 'Latitude', 'Longitude', 'Upvotes', 'Date', 'AdminNote']
    const rows = reports.map((r) => [
      `TN-CT-${String(r.id).padStart(5, '0')}`,
      `"${(r.title || '').replace(/"/g, '""')}"`,
      r.category,
      r.status,
      r.priority,
      r.district || 'Chennai',
      r.department || 'GCC',
      r.latitude,
      r.longitude,
      r.upvotes || 0,
      new Date(r.createdAt).toISOString().split('T')[0],
      `"${(r.adminNote || '').replace(/"/g, '""')}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `TamilNadu_CivicTrack_Reports_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const nav = [
    ['overview', 'Overview', Activity],
    ['map', 'Issue Map', MapPin],
    ['reports', 'All Reports', ClipboardList],
    ['announcements', 'Civic Alerts', RadioTower],
    ['analytics', 'Analytics', BarChart3],
    ['admin', 'Admin Desk', ShieldCheck]
  ]

  return (
    <div className="app-shell">
      {/* Sidebar with Tamil Nadu Royal Maroon & Gold theme */}
      <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Building2 size={22} />
          </div>
          <div>
            <div className="brand-main">தமிழ்நாடு <span>UrbanSync</span></div>
            <small>GOVERNMENT OF TAMIL NADU</small>
          </div>
        </div>

        <div className="side-label">CITIZEN & CIVIC DESK</div>

        <nav>
          {nav.map(([id, label, Icon]) => (
            <button
              key={id}
              className={tab === id ? 'active' : ''}
              onClick={() => {
                setTab(id)
                setMobileMenu(false)
              }}
            >
              <Icon size={17} />
              <span>{label}</span>
              {id === 'reports' && <b>{reports.length}</b>}
              {id === 'admin' && adminUser && <span className="auth-dot active" title="Officer logged in" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="city-card">
            <div className="city-icon">
              <span className="tn-seal">வாய்மையே வெல்லும்</span>
            </div>
            <b>தூய்மையான தமிழ்நாடு</b>
            <p>Every report empowers local municipal bodies to build safer, cleaner neighbourhoods.</p>
          </div>

          <div className="profile">
            <div className="avatar">{adminUser ? 'TN' : 'CZ'}</div>
            <div>
              <b>{adminUser ? adminUser.displayName || 'Municipal Officer' : 'Citizen Portal'}</b>
              <small>{adminUser ? 'Officer Access Active' : 'Public Access'}</small>
            </div>
            <span className={`online-dot ${adminUser ? 'admin-online' : ''}`} />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-area">
        {/* Top Navigation Bar */}
        <header className="topbar">
          <button className="mobile-toggle icon-btn" onClick={() => setMobileMenu(!mobileMenu)}>
            <Menu />
          </button>

          <div className="breadcrumb">
            <span>Tamil Nadu CivicTrack</span>
            <span className="sep">/</span>
            <b>{nav.find((n) => n[0] === tab)?.[1]}</b>
          </div>

          <div className="top-actions">
            {/* Quick District Selector */}
            <div className="topbar-district-wrap">
              <MapPin size={14} />
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="topbar-district-select"
                title="Filter by Tamil Nadu District"
              >
                <option value="ALL">All Tamil Nadu</option>
                {districts.filter((d) => d !== 'ALL').map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <button className="primary-btn report-cta-btn" onClick={() => setShowForm(true)}>
              <Plus size={16} />
              <span>Report an Issue</span>
            </button>
          </div>
        </header>

        <div className="page-content">
          {/* Hero Banner with Tamil Nadu Background Image */}
          <section className="welcome-banner">
            <div className="banner-bg-overlay" />
            <div className="banner-content">
              <div className="banner-eyebrow">
                <span className="live-dot" /> TAMIL NADU CIVIC GRIEVANCE REDRESSAL PORTAL
              </div>
              <h1>
                {tab === 'overview'
                  ? 'Building cleaner, safer streets across'
                  : tab === 'map'
                    ? 'Geospatial issue monitoring across'
                    : tab === 'admin'
                      ? 'Officer Command & Administration'
                      : tab === 'announcements'
                        ? 'Public Advisories & Civic'
                        : tab === 'analytics'
                          ? 'Statewide Resolution'
                          : 'Public Grievance Reports in'}{' '}
                <em>{districtFilter === 'ALL' ? 'Tamil Nadu.' : `${districtFilter}.`}</em>
              </h1>
              <p>
                Collaborative governance connecting citizens with Greater Chennai Corporation, Municipalities, TANGEDCO, and Highways Department.
              </p>
            </div>

            <div className="hero-emblem-badge">
              <div className="emblem-text">
                <b>தமிழ்நாடு அரசு</b>
                <span>CITIZEN ACTION<br /><b>DIRECT RESOLUTION</b></span>
              </div>
            </div>
          </section>

          {/* Tab 1: Overview */}
          {tab === 'overview' && (
            <>
              <section className="stat-grid">
                <Stat icon={<ClipboardList />} label="TOTAL REPORTS" value={stats.total} note="Statewide grievances" color="gold" />
                <Stat icon={<RadioTower />} label="ACTIVE ISSUES" value={stats.active} note="Pending field action" color="maroon" />
                <Stat icon={<Activity />} label="IN PROGRESS" value={stats.progress} note="Crews deployed" color="amber" />
                <Stat icon={<CheckCircle2 />} label="RESOLVED" value={stats.resolved} note="Successfully closed" color="green" />
              </section>

              <section className="overview-grid">
                <div className="panel map-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">GEOSPATIAL RADAR</span>
                      <h2>Live Issue Radar</h2>
                    </div>
                    <button className="small-outline" onClick={() => setTab('map')}>
                      Explore Map <ArrowUpRight size={14} />
                    </button>
                  </div>
                  <MapView reports={reports} />
                  <div className="map-legend">
                    <span><i className="legend-dot open-dot" />Open</span>
                    <span><i className="legend-dot progress-dot" />In Progress</span>
                    <span><i className="legend-dot done-dot" />Resolved</span>
                    <b>{reports.length} mapped civic reports</b>
                  </div>
                </div>

                <div className="panel activity-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">COMMUNITY FEED</span>
                      <h2>Latest Grievances</h2>
                    </div>
                    <button className="icon-btn" onClick={() => setTab('reports')}>
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                  <div className="activity-list">
                    {reports.slice(0, 5).map((r) => (
                      <div className="activity-item" key={r.id} onClick={() => setSelected(r)}>
                        <div className="activity-icon">
                          <MapPin size={16} />
                        </div>
                        <div className="activity-info">
                          <b>{r.title}</b>
                          <small>
                            {r.district || 'Tamil Nadu'} · {r.category.replaceAll('_', ' ')} ·{' '}
                            {new Date(r.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="activity-right">
                          <span className={`mini-status ${r.status.toLowerCase()}`}>
                            {r.status === 'IN_PROGRESS' ? 'ACTIVE' : r.status === 'RESOLVED' ? 'RESOLVED' : 'SUBMITTED'}
                          </span>
                          {r.upvotes > 0 && (
                            <span className="mini-upvotes">
                              <ThumbsUp size={10} /> {r.upvotes}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {!reports.length && <Empty text="No reports yet. Be the first to report an issue in your locality." />}
                  </div>
                </div>
              </section>

              <section className="section-head">
                <div>
                  <span className="eyebrow">PRIORITY COMMUNITY GRIEVANCES</span>
                  <h2>Issues Requiring Urgent Municipal Attention</h2>
                </div>
                <button className="text-action" onClick={() => setTab('reports')}>
                  View all grievances <ArrowUpRight size={15} />
                </button>
              </section>
              <ReportGrid
                reports={reports.slice(0, 6)}
                onSelect={setSelected}
                onUpvote={handleUpvote}
              />
            </>
          )}

          {/* Tab 2: Map */}
          {tab === 'map' && (
            <section className="panel full-map-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">GIS PORTAL</span>
                  <h2>Interactive Tamil Nadu Civic Map</h2>
                  <p>Click any pin to inspect the reported grievance, photo evidence, and live resolution status.</p>
                </div>
                <span className="map-count">{reports.length} ISSUES PINPOINTED</span>
              </div>
              <MapView reports={reports} zoom={11} />
            </section>
          )}

          {/* Tab 3: Reports */}
          {tab === 'reports' && (
            <>
              <div className="filter-row">
                <div className="search-wrap">
                  <Search size={16} />
                  <input
                    placeholder="Search by title, description, district, or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="filter-selects">
                  <select
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="ALL">All Districts</option>
                    {districts.filter((d) => d !== 'ALL').map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="filter-select"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c.replaceAll('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <ReportGrid reports={visible} onSelect={setSelected} onUpvote={handleUpvote} />
              {!visible.length && <Empty text="No reports match your filters. Try selecting a different district or category." />}
            </>
          )}

          {/* Tab 4: Civic Announcements */}
          {tab === 'announcements' && (
            <AnnouncementsView isAdmin={!!adminUser} onAlertPublished={refresh} />
          )}

          {/* Tab 5: Analytics */}
          {tab === 'analytics' && <AnalyticsView />}

          {/* Tab 6: Admin Desk with Secure Gate */}
          {tab === 'admin' && (
            <>
              {!adminUser ? (
                <AdminLogin onLoginSuccess={(session) => setAdminUser(session)} />
              ) : (
                <section className="panel admin-panel">
                  <div className="admin-header-toolbar">
                    <div className="officer-identity">
                      <div className="officer-avatar">TN</div>
                      <div>
                        <div className="officer-role-badge">VERIFIED MUNICIPAL DESK OFFICER</div>
                        <h3>{adminUser.displayName || 'Tamil Nadu Civic Administrator'}</h3>
                        <small>{adminUser.department || 'Greater Chennai Corporation & Municipal Directorate'}</small>
                      </div>
                    </div>

                    <div className="admin-actions-bar">
                      <button type="button" className="small-outline export-btn" onClick={exportCSV}>
                        <Download size={14} />
                        <span>Export CSV Report</span>
                      </button>

                      <button type="button" className="logout-btn" onClick={handleLogout}>
                        <LogOut size={14} />
                        <span>End Session</span>
                      </button>
                    </div>
                  </div>

                  <div className="admin-table-filters">
                    <div className="search-wrap sm-search">
                      <Search size={14} />
                      <input
                        placeholder="Search officer queue..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <span className="queue-count">{visible.length} issues in queue</span>
                  </div>

                  <div className="admin-cards-list">
                    {visible.map((r) => {
                      const edits = adminEdits[r.id] || {}
                      const currentStatus = edits.status || r.status
                      const currentPriority = edits.priority || r.priority || 'MEDIUM'
                      const currentDept = edits.department || r.department || 'GCC_CORPORATION'
                      const currentDays = edits.estimatedDays !== undefined ? edits.estimatedDays : (r.estimatedDays || 3)
                      const currentNote = edits.adminNote !== undefined ? edits.adminNote : (r.adminNote || '')
                      const saveStatus = adminSaveStatus[r.id]

                      return (
                        <div className="admin-card-item" key={r.id}>
                          <div className="admin-card-header">
                            <div className="admin-report-title">
                              <b>TN-CT-{String(r.id).padStart(5, '0')} · {r.title}</b>
                              <div className="admin-report-tags">
                                <span className="cat-pill">{r.category.replaceAll('_', ' ')}</span>
                                <span className="dist-pill">{r.district || 'Chennai'}</span>
                                <small>Submitted: {new Date(r.createdAt).toLocaleString()}</small>
                                {r.citizenName && <small>· Citizen: {r.citizenName}</small>}
                                {r.citizenPhone && <small>· Phone: {r.citizenPhone}</small>}
                                <small>· {r.upvotes || 0} Upvotes</small>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="admin-delete-btn"
                              title="Delete report"
                              onClick={() => handleDeleteReport(r.id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div className="admin-controls-grid">
                            <label>
                              Lifecycle Status
                              <select
                                value={currentStatus}
                                onChange={(e) => handleAdminFieldChange(r.id, 'status', e.target.value)}
                              >
                                {['SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </label>

                            <label>
                              Priority Severity
                              <select
                                value={currentPriority}
                                onChange={(e) => handleAdminFieldChange(r.id, 'priority', e.target.value)}
                              >
                                <option value="LOW">LOW</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="HIGH">HIGH</option>
                                <option value="CRITICAL">CRITICAL (Emergency)</option>
                              </select>
                            </label>

                            <label>
                              Routing Department
                              <select
                                value={currentDept}
                                onChange={(e) => handleAdminFieldChange(r.id, 'department', e.target.value)}
                              >
                                <option value="GCC_CORPORATION">Greater Chennai Corporation (GCC)</option>
                                <option value="CMWSSB_WATER">Chennai Metrowater & Sewerage (CMWSSB)</option>
                                <option value="TANGEDCO_POWER">TANGEDCO (Electricity Board)</option>
                                <option value="HIGHWAYS_DEPT">State Highways Department</option>
                                <option value="SOLID_WASTE">Solid Waste & Sanitization</option>
                                <option value="GENERAL_ADMIN">General Municipal Administration</option>
                              </select>
                            </label>

                            <label>
                              SLA Estimated Days
                              <input
                                type="number"
                                min="0"
                                max="90"
                                value={currentDays}
                                onChange={(e) => handleAdminFieldChange(r.id, 'estimatedDays', e.target.value)}
                              />
                            </label>
                          </div>

                          <div className="admin-note-row">
                            <input
                              type="text"
                              placeholder="Official public update / action note for citizens..."
                              value={currentNote}
                              onChange={(e) => handleAdminFieldChange(r.id, 'adminNote', e.target.value)}
                            />

                            <button
                              type="button"
                              className={`admin-save-btn ${saveStatus === 'success' ? 'saved' : ''}`}
                              onClick={() => handleSaveAdminUpdate(r.id)}
                              disabled={saveStatus === 'saving'}
                            >
                              {saveStatus === 'saving' ? (
                                <span>Saving...</span>
                              ) : saveStatus === 'success' ? (
                                <>
                                  <Check size={14} />
                                  <span>Saved!</span>
                                </>
                              ) : (
                                <>
                                  <Save size={14} />
                                  <span>Save Update</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                    {!visible.length && <Empty text="No grievances in the officer triage queue." />}
                  </div>
                </section>
              )}
            </>
          )}

          {/* Footer */}
          <footer>
            <div className="footer-left">
              <span>© 2026 தமிழ்நாடு CIVICTRACK · GOVERNMENT OF TAMIL NADU</span>
              <span className="footer-motto">வாய்மையே வெல்லும் · TRUTH ALONE TRIUMPHS</span>
            </div>
            <div className="footer-right">
              <span>MUNICIPAL ADMINISTRATION & WATER SUPPLY</span>
              <span>POWERED BY CITIZEN PARTICIPATION</span>
            </div>
          </footer>
        </div>
      </main>

      {/* Modals */}
      {showForm && (
        <ReportModal
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false)
            refresh()
            setTab('reports')
          }}
        />
      )}

      {selected && (
        <DetailModal
          report={selected}
          onClose={() => setSelected(null)}
          onUpvote={handleUpvote}
        />
      )}
    </div>
  )
}

function Stat({ icon, label, value, note, color }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-top">
        {icon}
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  )
}

function ReportGrid({ reports, onSelect, onUpvote }) {
  return (
    <div className="report-grid">
      {reports.map((r) => (
        <ReportCard key={r.id} report={r} onClick={() => onSelect(r)} onUpvote={onUpvote} />
      ))}
    </div>
  )
}

function Empty({ text }) {
  return (
    <div className="empty-state">
      <MapPin size={26} />
      <p>{text}</p>
    </div>
  )
}
