import React, { useState, useEffect } from 'react'
import {
  X,
  MapPin,
  CalendarDays,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  Send,
  Building2,
  Clock,
  User,
  AlertCircle
} from 'lucide-react'
import { api, imageUrl } from '../api'

const steps = ['SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED']

export default function DetailModal({ report, onClose, onUpvote }) {
  if (!report) return null

  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [loadingComments, setLoadingComments] = useState(true)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentError, setCommentError] = useState('')
  const [upvotes, setUpvotes] = useState(report.upvotes || 0)
  const [upvoted, setUpvoted] = useState(false)

  const currentStep = steps.indexOf(report.status)

  const fetchComments = async () => {
    try {
      const res = await api.get(`/reports/${report.id}/comments`)
      setComments(res.data)
    } catch (e) {
      setComments([])
    } finally {
      setLoadingComments(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [report.id])

  const handleUpvote = async () => {
    if (upvoted) return
    try {
      const res = await api.post(`/reports/${report.id}/upvote`)
      setUpvotes(res.data.upvotes)
      setUpvoted(true)
      if (onUpvote) onUpvote(report.id)
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmittingComment(true)
    setCommentError('')
    try {
      const token = localStorage.getItem('civictrack_admin_token')
      const isOfficial = !!token

      await api.post(`/reports/${report.id}/comments`, {
        authorName: authorName.trim() || (isOfficial ? 'GCC Field Operations' : 'Tamil Nadu Citizen'),
        content: commentText.trim(),
        isOfficial
      })

      setCommentText('')
      fetchComments()
    } catch (err) {
      setCommentError(err.response?.data?.error || 'Failed to submit comment.')
    } finally {
      setSubmittingComment(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="modal detail-modal">
        <div className="modal-head">
          <div>
            <div className="detail-tags-row">
              <span className="eyebrow">TN-CT-{String(report.id).padStart(5, '0')}</span>
              {report.district && <span className="district-tag">{report.district}</span>}
              {report.priority && (
                <span className={`priority-tag priority-${report.priority.toLowerCase()}`}>
                  {report.priority} PRIORITY
                </span>
              )}
            </div>
            <h2>{report.title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X />
          </button>
        </div>

        {report.photoUrl && (
          <div className="detail-photo-wrap">
            <img className="detail-image" src={imageUrl(report.photoUrl)} alt="Reported issue" />
          </div>
        )}

        <div className="detail-badges-bar">
          <span className={`status status-${report.status.toLowerCase()}`}>
            Status: {report.status.replaceAll('_', ' ')}
          </span>
          {report.department && (
            <span className="dept-badge">
              <Building2 size={13} /> {report.department.replaceAll('_', ' ')}
            </span>
          )}
          {report.estimatedDays != null && (
            <span className="sla-badge">
              <Clock size={13} /> SLA: ~{report.estimatedDays} days
            </span>
          )}
          <button
            type="button"
            className={`detail-upvote-btn ${upvoted ? 'active' : ''}`}
            onClick={handleUpvote}
          >
            <ThumbsUp size={14} />
            <span>{upvotes} Upvotes</span>
          </button>
        </div>

        <p className="detail-desc">{report.description}</p>

        <div className="detail-meta">
          <span>
            <MapPin size={15} /> Coordinates: {Number(report.latitude).toFixed(5)},{' '}
            {Number(report.longitude).toFixed(5)}
          </span>
          <span>
            <CalendarDays size={15} /> Reported: {new Date(report.createdAt).toLocaleString()}
          </span>
          {report.citizenName && (
            <span>
              <User size={15} /> Reporter: {report.citizenName}
            </span>
          )}
        </div>

        <div className="timeline-section">
          <h3 className="timeline-title">Resolution & Tracking Lifecycle</h3>
          <div className="timeline">
            {steps.map((s, i) => (
              <div className={`timeline-step ${i <= currentStep ? 'done' : ''}`} key={s}>
                <i />
                <span>{s.replaceAll('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {report.adminNote && (
          <div className="admin-note">
            <div className="note-header">
              <ShieldCheck size={16} />
              <b>Official Action Note from Municipal Authority</b>
            </div>
            <p>{report.adminNote}</p>
          </div>
        )}

        {/* Citizen & Field Comments Discussion */}
        <div className="comments-section">
          <div className="comments-head">
            <MessageSquare size={16} />
            <h3>Community Updates & Field Discussions ({comments.length})</h3>
          </div>

          <div className="comments-list">
            {loadingComments ? (
              <div className="loading-sm">Loading field updates...</div>
            ) : comments.length === 0 ? (
              <p className="no-comments">No updates or comments yet. Add the first update below.</p>
            ) : (
              comments.map((c) => (
                <div className={`comment-card ${c.isOfficial ? 'official-comment' : ''}`} key={c.id}>
                  <div className="comment-top">
                    <b>{c.authorName}</b>
                    {c.isOfficial && (
                      <span className="official-pill">
                        <ShieldCheck size={11} /> GCC / Municipal Verified
                      </span>
                    )}
                    <small>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                  </div>
                  <p>{c.content}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="comment-form">
            <div className="comment-input-row">
              <input
                type="text"
                placeholder="Your name or designation..."
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="comment-author-input"
              />
              <input
                type="text"
                required
                placeholder="Share an update, status, or comment on this issue..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="comment-text-input"
              />
              <button type="submit" className="comment-submit-btn" disabled={submittingComment}>
                <Send size={15} />
              </button>
            </div>
            {commentError && <span className="comment-err">{commentError}</span>}
          </form>
        </div>
      </section>
    </div>
  )
}
