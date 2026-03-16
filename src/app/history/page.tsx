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

  // Recommendation
  if (filters.recommendation !== 'All') {
    result = result.filter((a) => a.recommendation === filters.recommendation)
  }

  // Period
  if (filters.period !== 'all') {
    const since = new Date()
    if (filters.period === 'week') since.setDate(since.getDate() - 7)
    if (filters.period === 'month') since.setMonth(since.getMonth() - 1)
    result = result.filter((a) => new Date(a.created_at) >= since)
  }

  // Search
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

const isFiltered = (f: FilterState) =>
  f.recommendation !== 'All' || f.period !== 'all' || f.search.trim() !== ''

export default function HistoryPage() {
  const [allAnalyses, setAllAnalyses] = useState<HsAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [selectedAnalysis, setSelectedAnalysis] = useState<HsAnalysis | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch all analyses on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/analyses')
        const data = await res.json()
        if (Array.isArray(data)) setAllAnalyses(data)
      } catch (err) {
        console.error('Failed to fetch analyses:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const filteredAnalyses = useMemo(
    () => applyFilters(allAnalyses, filters),
    [allAnalyses, filters]
  )

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const handleFilterChange = useCallback((f: FilterState) => {
    setFilters(f)
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const handleRowClick = useCallback((a: HsAnalysis) => {
    setSelectedAnalysis(a)
  }, [])

  // Download report directly from table row
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
    } catch (err) {
      console.error('Download error:', err)
    }
  }, [])

  // Delete from table row (no drawer needed)
  const handleRowDelete = useCallback(async (a: HsAnalysis) => {
    try {
      const res = await fetch('/api/analyses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: a.id }),
      })
      if (res.ok) {
        setAllAnalyses((prev) => prev.filter((x) => x.id !== a.id))
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
  }, [])

  // Delete from drawer — optimistic update
  const handleDrawerDelete = useCallback((id: string) => {
    setAllAnalyses((prev) => prev.filter((a) => a.id !== id))
    setSelectedAnalysis(null)
  }, [])

  const handleDrawerClose = useCallback(() => {
    setSelectedAnalysis(null)
  }, [])

  return (
    <>
      <div className="min-h-screen bg-bg-primary">
        {/* Sticky header */}
        <header className="border-b border-border-default bg-bg-surface/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-1.5 group">
                <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-bold text-text-primary text-sm group-hover:text-accent transition-colors">
                  Hire<span className="text-accent">Signal</span>
                </span>
              </Link>
              <span className="text-border-default">·</span>
              <span className="text-xs text-text-muted font-mono hidden sm:block">Analysis History</span>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors"
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
          <div className="bg-bg-surface border border-border-default rounded-xl p-5">
            <FilterBar
              totalCount={allAnalyses.length}
              filteredCount={filteredAnalyses.length}
              onChange={handleFilterChange}
            />
          </div>

          {/* Table */}
          <AnalysisTable
            analyses={filteredAnalyses}
            onRowClick={handleRowClick}
            onDownload={handleRowDownload}
            onDelete={handleRowDelete}
            isLoading={loading}
            isFiltered={isFiltered(filters)}
            onClearFilters={handleClearFilters}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
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
