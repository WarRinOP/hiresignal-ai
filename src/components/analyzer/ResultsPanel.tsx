'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { HsAnalysis } from '@/lib/supabase'
import MatchRing from './MatchRing'
import RecommendationBadge from './RecommendationBadge'
import SkillsBreakdown from './SkillsBreakdown'
import KeywordGaps from './KeywordGaps'
import StrengthsWeaknesses from './StrengthsWeaknesses'
import BulletRewriter from './BulletRewriter'
import Button from '@/components/ui/Button'

interface ResultsPanelProps {
  result: HsAnalysis | null
  onReset: () => void
}

export default function ResultsPanel({ result, onReset }: ResultsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  // Smooth scroll to panel when result appears
  useEffect(() => {
    if (result && panelRef.current) {
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [result])

  if (!result) return null

  const handleDownloadReport = async () => {
    setDownloading(true)
    try {
      const res = await fetch(`/api/report?id=${result.id}`)
      if (!res.ok) throw new Error('Failed to generate report')
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition') || ''
      const filenameMatch = disposition.match(/filename="([^"]+)"/)
      const filename = filenameMatch ? filenameMatch[1] : 'hiresignal-report.txt'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      ref={panelRef}
      className="space-y-4 animate-fade-in-up"
      style={{ animationDuration: '400ms', animationFillMode: 'both' }}
    >
      {/* Card 1 — Match Overview */}
      <div className="bg-bg-surface border border-border-default rounded-xl p-6">
        <div className="flex items-start gap-6">
          <MatchRing score={result.match_score} size={120} />
          <div className="flex-1 min-w-0">
            <RecommendationBadge recommendation={result.recommendation} />
            <p className="mt-3 text-sm text-text-secondary leading-relaxed">
              {result.recommendation_reason}
            </p>
            {result.candidate_name && (
              <p className="mt-2 text-xs text-text-muted font-mono">
                Candidate: {result.candidate_name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Card 2 — Skills + Keyword Gaps */}
      <div className="bg-bg-surface border border-border-default rounded-xl p-6 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Skills Breakdown</h3>
          <SkillsBreakdown
            matchedSkills={result.matched_skills}
            missingSkills={result.missing_skills}
          />
        </div>
        <div className="border-t border-border-default pt-5">
          <KeywordGaps keywordGaps={result.keyword_gaps} />
        </div>
      </div>

      {/* Card 3 — Strengths & Weaknesses */}
      <div className="bg-bg-surface border border-border-default rounded-xl p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Candidate Profile</h3>
        <StrengthsWeaknesses
          strengths={result.strengths}
          weaknesses={result.weaknesses}
        />
      </div>

      {/* Card 4 — Bullet Rewriter */}
      {result.bullet_rewrites && result.bullet_rewrites.length > 0 && (
        <div className="bg-bg-surface border border-border-default rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-1">Resume Improvements</h3>
          <p className="text-xs text-text-muted mb-1">
            AI-suggested rewrites to better match the job description
          </p>
          <BulletRewriter bulletRewrites={result.bullet_rewrites} />
        </div>
      )}

      {/* Card 5 — Actions */}
      <div className="bg-bg-surface border border-border-default rounded-xl p-5">
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={handleDownloadReport}
            loading={downloading}
            className="flex-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Report
          </Button>
          <Button variant="ghost" onClick={onReset} className="flex-1">
            New Analysis
          </Button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-1 text-xs text-text-muted">
          <svg className="w-3.5 h-3.5 text-hire" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Analysis saved to history
          <Link
            href="/history"
            className="ml-2 text-accent hover:text-accent-hover underline underline-offset-2"
          >
            View History →
          </Link>
        </div>
      </div>
    </div>
  )
}
