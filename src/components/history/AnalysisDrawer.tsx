'use client'

import { useEffect, useRef, useState } from 'react'
import type { HsAnalysis } from '@/lib/supabase'
import MatchRing from '@/components/analyzer/MatchRing'
import RecommendationBadge from '@/components/analyzer/RecommendationBadge'
import SkillsBreakdown from '@/components/analyzer/SkillsBreakdown'
import KeywordGaps from '@/components/analyzer/KeywordGaps'
import StrengthsWeaknesses from '@/components/analyzer/StrengthsWeaknesses'
import BulletRewriter from '@/components/analyzer/BulletRewriter'
import Button from '@/components/ui/Button'

interface AnalysisDrawerProps {
  analysis: HsAnalysis | null
  onClose: () => void
  onDelete: (id: string) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 2) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  return formatDate(iso)
}

export default function AnalysisDrawer({ analysis, onClose, onDelete }: AnalysisDrawerProps) {
  const [deleting, setDeleting] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const isOpen = analysis !== null

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Escape key closes drawer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleDownload = async () => {
    if (!analysis) return
    setDownloading(true)
    try {
      const res = await fetch(`/api/report?id=${analysis.id}`)
      if (!res.ok) throw new Error('Failed')
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition') ?? ''
      const match = disposition.match(/filename="([^"]+)"/)
      const filename = match ? match[1] : 'report.txt'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = filename
      document.body.appendChild(a); a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // silent
    } finally {
      setDownloading(false)
    }
  }

  const handleDelete = async () => {
    if (!analysis) return
    setDeleting(true)
    try {
      const res = await fetch('/api/analyses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: analysis.id }),
      })
      if (!res.ok) throw new Error('Delete failed')
      onDelete(analysis.id)
      onClose()
    } catch {
      // silent
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[480px] bg-bg-surface border-l border-border-default shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-bg-surface2 border border-border-default flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {analysis && (
            <div className="p-6 space-y-6 pb-28">
              {/* Header */}
              <div className="flex items-start gap-4 pt-2">
                <MatchRing score={analysis.match_score} size={80} />
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <RecommendationBadge recommendation={analysis.recommendation} />
                  </div>
                  <p className="text-base font-medium text-text-primary">
                    {analysis.candidate_name || 'Anonymous'}
                  </p>
                  <p className="text-sm text-text-secondary mt-0.5">
                    {analysis.role_title}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {relativeDate(analysis.created_at)}
                  </p>
                </div>
              </div>

              {/* Signal chips row */}
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-bg-surface2 border border-border-default text-text-secondary">
                  Score: {analysis.match_score}%
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-bg-surface2 border border-border-default text-text-secondary">
                  {analysis.recommendation}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-bg-surface2 border border-border-default text-text-muted">
                  {formatDate(analysis.created_at)}
                </span>
              </div>

              {/* Recommendation reason */}
              <div className="p-4 rounded-lg bg-bg-surface2 border border-border-default">
                <p className="text-xs text-text-secondary leading-relaxed">
                  {analysis.recommendation_reason}
                </p>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <p className="text-sm font-semibold text-text-primary">Skills Breakdown</p>
                <SkillsBreakdown
                  matchedSkills={analysis.matched_skills}
                  missingSkills={analysis.missing_skills}
                />
                <div className="pt-3 border-t border-border-default">
                  <KeywordGaps keywordGaps={analysis.keyword_gaps} />
                </div>
              </div>

              {/* Strengths / Weaknesses */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-text-primary">Candidate Profile</p>
                <StrengthsWeaknesses
                  strengths={analysis.strengths}
                  weaknesses={analysis.weaknesses}
                />
              </div>

              {/* Bullet rewrites */}
              {analysis.bullet_rewrites && analysis.bullet_rewrites.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-text-primary">Resume Improvements</p>
                  <BulletRewriter bulletRewrites={analysis.bullet_rewrites} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky footer */}
        {analysis && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-bg-surface border-t border-border-default flex gap-3">
            <Button
              variant="primary"
              onClick={handleDownload}
              loading={downloading}
              className="flex-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Report
            </Button>
            <Button
              variant="ghost"
              onClick={handleDelete}
              loading={deleting}
              className="flex-1 !text-pass hover:!border-pass/30 hover:!bg-pass/5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
