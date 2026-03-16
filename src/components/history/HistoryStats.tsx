'use client'

import type { HsAnalysis } from '@/lib/supabase'

interface HistoryStatsProps {
  analyses: HsAnalysis[]
  loading?: boolean
}

function getScoreColor(score: number): string {
  if (score >= 70) return '#22c55e'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

function SkeletonCard() {
  return (
    <div className="bg-bg-surface border border-border-default rounded-lg p-5 animate-pulse">
      <div className="h-3 w-20 bg-bg-surface2 rounded mb-3" />
      <div className="h-7 w-16 bg-bg-surface2 rounded" />
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  valueColor?: string
  sub?: string
}

function StatCard({ label, value, valueColor, sub }: StatCardProps) {
  return (
    <div className="bg-bg-surface border border-border-default rounded-lg p-5">
      <p className="label-caps mb-2">{label}</p>
      <p
        className="font-mono text-[28px] font-medium leading-none"
        style={{ color: valueColor ?? 'var(--color-text-primary)' }}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-text-muted mt-1.5">{sub}</p>}
    </div>
  )
}

export default function HistoryStats({ analyses, loading }: HistoryStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const total = analyses.length
  const avgScore =
    total === 0
      ? 0
      : Math.round(analyses.reduce((sum, a) => sum + a.match_score, 0) / total)
  const hireCount = analyses.filter((a) => a.recommendation === 'Hire').length

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const thisWeek = analyses.filter(
    (a) => new Date(a.created_at) >= oneWeekAgo
  ).length

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Analyses" value={String(total)} />
      <StatCard
        label="Average Match"
        value={total === 0 ? '—' : `${avgScore}%`}
        valueColor={total === 0 ? undefined : getScoreColor(avgScore)}
      />
      <StatCard
        label="Hire Rate"
        value={total === 0 ? '—' : `${hireCount} of ${total}`}
        valueColor={hireCount > 0 ? '#22c55e' : undefined}
      />
      <StatCard label="This Week" value={String(thisWeek)} />
    </div>
  )
}
