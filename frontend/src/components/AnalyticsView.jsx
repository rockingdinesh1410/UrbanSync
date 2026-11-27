import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ThumbsUp,
  Building2,
  MapPin,
  ClipboardList
} from 'lucide-react'
import { api } from '../api'

export default function AnalyticsView() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/reports/analytics')
        setData(res.data)
      } catch (e) {
        console.error('Failed to load analytics', e)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return <div className="loading-state">Loading state civic metrics...</div>
  }

  if (!data) {
    return <div className="empty-state">Unable to load analytics at this time.</div>
  }

  const resolveRate = data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <span className="eyebrow">STATEWIDE CIVIC METRICS & GOVERNANCE PULSE</span>
          <h2>Tamil Nadu Municipal Grievance Analytics</h2>
          <p>Real-time grievance resolution monitoring across Greater Chennai and Tamil Nadu districts.</p>
        </div>
      </div>

      <div className="analytics-stat-row">
        <div className="stat-card">
          <div className="stat-top">
            <ClipboardList className="stat-icon-gold" />
            <span>TOTAL GRIEVANCES</span>
          </div>
          <strong>{data.total}</strong>
          <small>Citizen submissions logged</small>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <CheckCircle2 className="stat-icon-green" />
            <span>RESOLUTION RATE</span>
          </div>
          <strong>{resolveRate}%</strong>
          <small>{data.resolved} complaints resolved</small>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <TrendingUp className="stat-icon-blue" />
            <span>ACTIVE TRIAGE</span>
          </div>
          <strong>{data.active}</strong>
          <small>{data.inProgress} currently in progress</small>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <Flame className="stat-icon-red" />
            <span>CRITICAL & HIGH</span>
          </div>
          <strong>{data.highOrCritical || 0}</strong>
          <small>Priority civic emergencies</small>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <ThumbsUp className="stat-icon-gold" />
            <span>COMMUNITY ENDORSEMENTS</span>
          </div>
          <strong>{data.totalUpvotes || 0}</strong>
          <small>Citizen upvotes received</small>
        </div>
      </div>

      <div className="analytics-charts-grid">
        {/* District Breakdown */}
        <div className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">DISTRICT WISE DEMAND</span>
              <h2>Grievances by District</h2>
            </div>
          </div>
          <div className="breakdown-list">
            {Object.entries(data.districts || {}).map(([dist, count]) => {
              const pct = data.total > 0 ? Math.round((count / data.total) * 100) : 0
              return (
                <div className="breakdown-item" key={dist}>
                  <div className="breakdown-info">
                    <span className="breakdown-label">
                      <MapPin size={13} /> {dist}
                    </span>
                    <span className="breakdown-count">
                      <b>{count}</b> reports ({pct}%)
                    </span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill bar-gold" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Issue Category Breakdown */}
        <div className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">INFRASTRUCTURE CATEGORIES</span>
              <h2>Issues by Problem Type</h2>
            </div>
          </div>
          <div className="breakdown-list">
            {Object.entries(data.categories || {}).map(([cat, count]) => {
              const pct = data.total > 0 ? Math.round((count / data.total) * 100) : 0
              return (
                <div className="breakdown-item" key={cat}>
                  <div className="breakdown-info">
                    <span className="breakdown-label">{cat.replaceAll('_', ' ')}</span>
                    <span className="breakdown-count">
                      <b>{count}</b> issues ({pct}%)
                    </span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill bar-maroon" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Department Distribution */}
        <div className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">DEPARTMENTAL ROUTING</span>
              <h2>Assigned Civic Agencies</h2>
            </div>
          </div>
          <div className="breakdown-list">
            {Object.entries(data.departments || {}).map(([dept, count]) => {
              const pct = data.total > 0 ? Math.round((count / data.total) * 100) : 0
              return (
                <div className="breakdown-item" key={dept}>
                  <div className="breakdown-info">
                    <span className="breakdown-label">
                      <Building2 size={13} /> {dept.replaceAll('_', ' ')}
                    </span>
                    <span className="breakdown-count">
                      <b>{count}</b> assigned ({pct}%)
                    </span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill bar-green" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
