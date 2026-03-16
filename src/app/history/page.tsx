'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { HsAnalysis } from '@/lib/supabase'
import HistoryStats from '@/components/history/HistoryStats'
import FilterBar, { type FilterState } from '@/components/history/FilterBar'
import AnalysisTable from '@/components/history/AnalysisTable'
import AnalysisDrawer from '@/components/history/AnalysisDrawer'

const DEFAULT_FILTERS: FilterState = {
  recommendation: 'All',
  period: 'all',
  search: '',
}

function applyFilters(analyses: HsAnalysis[], filters: FilterState): HsAnalysis[] {
  let result = [...analyses]
  if (filters.recommendation !== 'All') {
    result = result.filter((a) => a.recommendation === filters.recommendation)
  }
  if (filters.period !== 'all') {
    const since = new Date()
    if (filters.period === 'week') since.setDate(since.getDate() - 7)
    if (filters.period === 'month') since.setMonth(since.getMonth() - 1)
    result = result.filter((a) => new Date(a.created_at) >= since)
  }
  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase()
    result = result.filter(
      (a) =>
        a.candidate_name?.toLowerCase().includes(q) ||
        a.role_title?.toLowerCase().includes(q)
    )
  }
  return result
}

const hasActiveFilters = (f: FilterState) =>
  f.recommendation !== 'All' || f.period !== 'all' || f.search.trim() !== ''

function FetchErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-bg-surface border border-border-default rounded-xl py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-pass/10 border border-pass/30 flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-pass" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1">Failed to load analyses</h3>
      <p className="text-sm text-text-muted mb-4">Check your connection and try again.</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Retry
      </button>
    </div>
  )
}

export default function HistoryPage() {
  const [allAnalyses, setAllAnalyses] = useState<HsAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [selectedAnalysis, setSelectedAnalysis] = useState<HsAnalysis | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setFetchError(false)
    try {
      const res = await fetch('/api/analyses')
      if (!res.ok) throw new Error('Fetch failed')
      const data = await res.json()
      if (Array.isArray(data)) setAllAnalyses(data)
    } catch {
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const filteredAnalyses = useMemo(
    () => applyFilters(allAnalyses, filters),
    [allAnalyses, filters]
  )

  useEffect(() => { setCurrentPage(1) }, [filters])

  const handleFilterChange = useCallback((f: FilterState) => { setFilters(f) }, [])
  const handleClearFilters = useCallback(() => { setFilters(DEFAULT_FILTERS) }, [])
  const handleRowClick = useCallback((a: HsAnalysis) => { setSelectedAnalysis(a) }, [])

  const handleRowDownload = useCallback(async (a: HsAnalysis) => {
    try {
      const res = await fetch(`/api/report?id=${a.id}`)
      if (!res.ok) return
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition') ?? ''
      const match = disposition.match(/filename="([^"]+)"/)
      const filename = match ? match[1] : 'report.txt'
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url; anchor.download = filename
      document.body.appendChild(anchor); anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
    } catch {
      // silent
    }
  }, [])

  const handleRowDelete = useCallback(async (a: HsAnalysis) => {
    try {
      const res = await fetch('/api/analyses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: a.id }),
      })
      if (res.ok) setAllAnalyses((prev) => prev.filter((x) => x.id !== a.id))
    } catch {
      // silent
    }
  }, [])

  const handleDrawerDelete = useCallback((id: string) => {
    setAllAnalyses((prev) => prev.filter((a) => a.id !== id))
    setSelectedAnalysis(null)
  }, [])

  const handleDrawerClose = useCallback(() => { setSelectedAnalysis(null) }, [])

  return (
    <>
      <div className="min-h-screen bg-bg-primary">
        {/* Sticky header */}
        <header className="border-b border-border-default bg-bg-surface/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/" className="flex items-center gap-1.5 group flex-shrink-0">
                <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-bold text-text-primary text-sm group-hover:text-accent transition-colors">
                  Hire<span className="text-accent">Signal</span>
                </span>
              </Link>
              <span className="hidden sm:block text-border-default">·</span>
              <span className="hidden sm:block text-xs text-text-muted font-mono truncate">Analysis History</span>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors flex-shrink-0 ml-4"
            >
              New Analysis →
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Page heading */}
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Analysis History</h1>
            <p className="text-sm text-text-secondary mt-1">All resume analyses in one place</p>
          </div>

          {/* Stats — always derived from ALL analyses */}
          <HistoryStats analyses={allAnalyses} loading={loading} />

          {/* Filter bar */}
          <div className="bg-bg-surface border border-border-default rounded-xl p-4 sm:p-5">
            <FilterBar
              totalCount={allAnalyses.length}
              filteredCount={filteredAnalyses.length}
              onChange={handleFilterChange}
            />
          </div>

          {/* Table or error */}
          {fetchError ? (
            <FetchErrorState onRetry={fetchAll} />
          ) : (
            <AnalysisTable
              analyses={filteredAnalyses}
              onRowClick={handleRowClick}
              onDownload={handleRowDownload}
              onDelete={handleRowDelete}
              isLoading={loading}
              isFiltered={hasActiveFilters(filters)}
              onClearFilters={handleClearFilters}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}
        </main>
      </div>

      {/* Drawer */}
      <AnalysisDrawer
        analysis={selectedAnalysis}
        onClose={handleDrawerClose}
        onDelete={handleDrawerDelete}
      />
    </>
  )
}
