'use client'

import Link from 'next/link'
import type { HsAnalysis } from '@/lib/supabase'
import RecommendationBadge from '@/components/analyzer/RecommendationBadge'

const PAGE_SIZE = 10

interface AnalysisTableProps {
  analyses: HsAnalysis[]
  onRowClick: (analysis: HsAnalysis) => void
  onDownload: (analysis: HsAnalysis) => void
  onDelete?: (analysis: HsAnalysis) => void
  isLoading: boolean
  isFiltered?: boolean
  onClearFilters?: () => void
  currentPage: number
  onPageChange: (page: number) => void
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 2) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fullDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function ScoreChip({ score }: { score: number }) {
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <span
      className="inline-flex items-center justify-center w-10 h-10 rounded-full text-xs font-mono font-bold border-2"
      style={{ color, borderColor: color, background: `${color}15` }}
    >
      {score}
    </span>
  )
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border-default animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((c) => (
        <td key={c} className="px-4 py-3">
          <div className="h-4 bg-bg-surface2 rounded w-3/4" />
        </td>
      ))}
    </tr>
  )
}

export default function AnalysisTable({
  analyses,
  onRowClick,
  onDownload,
  onDelete,
  isLoading,
  isFiltered,
  onClearFilters,
  currentPage,
  onPageChange,
}: AnalysisTableProps) {

  const totalPages = Math.ceil(analyses.length / PAGE_SIZE)
  const start = (currentPage - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE
  const pageRows = analyses.slice(start, end)
  const totalShownStart = start + 1
  const totalShownEnd = Math.min(end, analyses.length)

  // Empty state — no analyses at all
  if (!isLoading && analyses.length === 0 && !isFiltered) {
    return (
      <div className="bg-bg-surface border border-border-default rounded-xl py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-bg-surface2 border border-border-default flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-text-primary mb-1">No analyses yet</h3>
        <p className="text-sm text-text-muted mb-4">Analyze your first resume to see history here</p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          Go to Analyzer →
        </Link>
      </div>
    )
  }

  // Empty state — filters return nothing
  if (!isLoading && analyses.length === 0 && isFiltered) {
    return (
      <div className="bg-bg-surface border border-border-default rounded-xl py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-bg-surface2 border border-border-default flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-text-primary mb-1">No analyses match your filters</h3>
        <button
          type="button"
          onClick={onClearFilters}
          className="text-sm text-accent hover:underline mt-1"
        >
          Clear filters
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-border-default">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border-default bg-bg-surface2/50">
              {['Score', 'Recommendation', 'Candidate', 'Role', 'Date', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left label-caps whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              : pageRows.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => onRowClick(a)}
                    className="border-b border-border-default last:border-0 hover:bg-bg-surface2 transition-colors cursor-pointer group"
                  >
                    {/* Score */}
                    <td className="px-4 py-3">
                      <ScoreChip score={a.match_score} />
                    </td>

                    {/* Recommendation badge */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div onClick={() => onRowClick(a)}>
                        <RecommendationBadge recommendation={a.recommendation} />
                      </div>
                    </td>

                    {/* Candidate */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-text-primary">
                        {a.candidate_name || 'Anonymous'}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-text-secondary">{a.role_title}</span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3">
                      <span
                        className="text-sm text-text-muted"
                        title={fullDate(a.created_at)}
                      >
                        {relativeTime(a.created_at)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        {/* Download */}
                        <button
                          type="button"
                          title="Download report"
                          onClick={() => onDownload(a)}
                          className="w-7 h-7 rounded flex items-center justify-center text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && analyses.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            Showing <span className="text-text-secondary font-medium">{totalShownStart}–{totalShownEnd}</span> of{' '}
            <span className="text-text-secondary font-medium">{analyses.length}</span> analyses
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="px-3 py-1.5 text-xs rounded-lg bg-bg-surface2 border border-border-default text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed hover:border-border-hover transition-colors"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-3 py-1.5 text-xs rounded-lg bg-bg-surface2 border border-border-default text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed hover:border-border-hover transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
