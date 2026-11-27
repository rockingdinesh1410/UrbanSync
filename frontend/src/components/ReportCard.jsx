import React from 'react'
import { MapPin, Clock, ThumbsUp, MessageSquare, ArrowUpRight, Flame } from 'lucide-react'
import { imageUrl } from '../api'

export default function ReportCard({ report, onClick, onUpvote }) {
  const isEmergency = report.priority === 'CRITICAL' || report.priority === 'HIGH'

  return (
    <article className="report-card" onClick={onClick}>
      <div className="report-photo">
        {report.photoUrl ? (
          <img src={imageUrl(report.photoUrl)} alt={report.title} loading="lazy" />
        ) : (
          <div className="photo-placeholder">
            <span className="placeholder-brand">தமிழ்நாடு CIVICTRACK</span>
            <span className="placeholder-cat">{report.category?.replaceAll('_', ' ')}</span>
          </div>
        )}

        <div className="card-top-badges">
          <span className={`status status-${report.status?.toLowerCase()}`}>
            {report.status?.replaceAll('_', ' ')}
          </span>
          {report.priority && (
            <span className={`priority-tag priority-${report.priority?.toLowerCase()}`}>
              {isEmergency && <Flame size={11} />}
              {report.priority}
            </span>
          )}
        </div>

        {report.district && (
          <div className="district-pill">
            <MapPin size={10} />
            <span>{report.district}</span>
          </div>
        )}
      </div>

      <div className="report-body">
        <div className="report-header-meta">
          <span className="eyebrow">{report.category?.replaceAll('_', ' ')}</span>
          <span className="dept-tag">{report.department?.replaceAll('_', ' ')}</span>
        </div>

        <h3>{report.title}</h3>
        <p>{report.description}</p>

        <div className="report-meta">
          <span>
            <Clock size={13} />
            {new Date(report.createdAt).toLocaleDateString()}
          </span>
          <span>
            <MapPin size={13} />
            {Number(report.latitude).toFixed(3)}, {Number(report.longitude).toFixed(3)}
          </span>
        </div>

        <div className="card-footer-actions">
          <button
            type="button"
            className="upvote-btn"
            title="Upvote: I face this issue too"
            onClick={(e) => {
              e.stopPropagation()
              onUpvote(report.id)
            }}
          >
            <ThumbsUp size={13} />
            <span>{report.upvotes || 0} Upvotes</span>
          </button>

          <button
            type="button"
            className="text-action"
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            <span>View & Discuss</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </article>
  )
}
