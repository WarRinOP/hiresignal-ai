'use client'

import { useEffect, useRef, useState } from 'react'

export type RecommendationFilter = 'All' | 'Hire' | 'Consider' | 'Pass'
export type PeriodFilter = 'week' | 'month' | 'all'

export interface FilterState {
  recommendation: RecommendationFilter
  period: PeriodFilter
  search: string
}

interface FilterBarProps {
  totalCount: number
  filteredCount: number
  onChange: (filters: FilterState) => void
}

const recOptions: RecommendationFilter[] = ['All', 'Hire', 'Consider', 'Pass']
const recColors: Record<RecommendationFilter, string> = {
  All: 'rgba(99,102,241,0.15)',
  Hire: 'rgba(34,197,94,0.15)',
  Consider: 'rgba(245,158,11,0.15)',
  Pass: 'rgba(239,68,68,0.15)',
}
const recTextColors: Record<RecommendationFilter, string> = {
  All: '#6366f1',
  Hire: '#22c55e',
  Consider: '#f59e0b',
  Pass: '#ef4444',
}
const recBorderColors: Record<RecommendationFilter, string> = {
  All: 'rgba(99,102,241,0.3)',
  Hire: 'rgba(34,197,94,0.3)',
  Consider: 'rgba(245,158,11,0.3)',
  Pass: 'rgba(239,68,68,0.3)',
}

const periodOptions: { label: string; value: PeriodFilter }[] = [
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'All Time', value: 'all' },
]

export default function FilterBar({ totalCount, filteredCount, onChange }: FilterBarProps) {
  const [recommendation, setRecommendation] = useState<RecommendationFilter>('All')
  const [period, setPeriod] = useState<PeriodFilter>('all')
  const [search, setSearch] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Emit combined filter state whenever anything changes
  useEffect(() => {
    onChange({ recommendation, period, search })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendation, period, search])

  const handleSearchChange = (val: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setSearch(val), 300)
  }

  const pillBase =
    'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none'

  const inactivePill =
    `${pillBase} bg-bg-surface2 border-border-default text-text-muted hover:border-border-hover hover:text-text-secondary`

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4 items-start">
        {/* Recommendation pills */}
        <div className="flex gap-1.5 flex-wrap">
          {recOptions.map((r) => {
            const active = recommendation === r
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRecommendation(r)}
                className={active ? `${pillBase}` : inactivePill}
                style={
                  active
                    ? {
                        background: recColors[r],
                        color: recTextColors[r],
                        borderColor: recBorderColors[r],
                      }
                    : undefined
                }
              >
                {r}
              </button>
            )
          })}
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px h-6 bg-border-default self-center" />

        {/* Period pills */}
        <div className="flex gap-1.5 flex-wrap">
          {periodOptions.map(({ label, value }) => {
            const active = period === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setPeriod(value)}
                className={
                  active
                    ? `${pillBase} bg-accent/15 text-accent border-accent/30`
                    : inactivePill
                }
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Search + count row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search candidate or role..."
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-bg-surface2 border border-border-default rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
          />
        </div>
        <p className="text-xs text-text-muted whitespace-nowrap flex-shrink-0">
          Showing <span className="text-text-secondary font-medium">{filteredCount}</span> of{' '}
          <span className="text-text-secondary font-medium">{totalCount}</span> analyses
        </p>
      </div>
    </div>
  )
}
