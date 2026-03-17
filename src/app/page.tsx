'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { HsAnalysis } from '@/lib/supabase'
import { getSessionId, getStoredRemaining, setStoredRemaining, MAX_ANALYSES, getAdminKey, setAdminKey, clearAdminKey, isAdminMode } from '@/lib/session'
import { HowItWorksModal } from '@/components/HowItWorksModal'
import ResumeUpload from '@/components/analyzer/ResumeUpload'
import JobDescInput, { SAMPLE_RESUME, SAMPLE_JD } from '@/components/analyzer/JobDescInput'
import ResultsPanel from '@/components/analyzer/ResultsPanel'
import { ToastContainer } from '@/components/ui/Toast'

function EmptyResultsPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full border-2 border-dashed border-border-default flex items-center justify-center">
          <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent/30 border border-accent/40" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-consider/30 border border-consider/40" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-2">Your analysis will appear here</h3>
      <p className="text-sm text-text-muted leading-relaxed max-w-xs">
        Fill in the form and click <span className="text-accent font-medium">Analyze Match →</span> to get a match score, skills gap analysis, and resume improvements.
      </p>
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {['Match Score', 'Skills Gap', 'Keyword Gaps', 'Bullet Rewrites', 'Report Download'].map((f) => (
          <span key={f} className="px-2.5 py-1 rounded-full text-xs text-text-muted border border-border-default bg-bg-surface2/50">{f}</span>
        ))}
      </div>
    </div>
  )
}

function AnalyzingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-bg-surface border border-border-default rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-[120px] h-[120px] rounded-full bg-bg-surface2 flex-shrink-0" />
          <div className="flex-1 w-full space-y-3">
            <div className="h-8 w-28 rounded-full bg-bg-surface2 mx-auto sm:mx-0" />
            <div className="h-3 w-full rounded bg-bg-surface2" />
            <div className="h-3 w-5/6 rounded bg-bg-surface2" />
            <div className="h-3 w-4/6 rounded bg-bg-surface2" />
          </div>
        </div>
      </div>
      <div className="bg-bg-surface border border-border-default rounded-xl p-6 space-y-3">
        <div className="h-4 w-32 rounded bg-bg-surface2" />
        <div className="grid grid-cols-2 gap-2">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-7 rounded-full bg-bg-surface2" />)}
        </div>
      </div>
      <div className="bg-bg-surface border border-border-default rounded-xl p-6 space-y-3">
        <div className="h-4 w-40 rounded bg-bg-surface2" />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-3 rounded bg-bg-surface2" />)}</div>
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-3 rounded bg-bg-surface2" />)}</div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 py-2">
        <svg className="animate-spin w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-xs text-text-muted font-mono">Analyzing with Claude...</span>
      </div>
    </div>
  )
}

export default function AnalyzerPage() {
  const [candidateName, setCandidateName] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<HsAnalysis | null>(null)
  const [remaining, setRemaining] = useState(() => isAdminMode() ? 999 : getStoredRemaining())
  const [admin, setAdmin] = useState(() => isAdminMode())
  const [showAdminInput, setShowAdminInput] = useState(false)
  const [adminCode, setAdminCode] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)
  const [sessionId] = useState(() => getSessionId())
  const [showModal, setShowModal] = useState(false)

  const handleLoadSample = () => {
    setCandidateName('Sarah Chen')
    setResumeText(SAMPLE_RESUME)
    setRoleTitle('Senior Software Engineer')
    setCompanyName('Google')
    setJobDescription(SAMPLE_JD)
    setError(null)
  }

  const verifyAdmin = async () => {
    setAdminLoading(true)
    try {
      const res = await fetch('/api/admin-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: adminCode }),
      })
      const data = await res.json()
      if (data.valid) {
        setAdminKey(adminCode)
        setAdmin(true)
        setRemaining(999)
        setShowAdminInput(false)
        setAdminCode('')
      } else {
        setAdminError('Invalid code')
      }
    } catch {
      setAdminError('Verification failed')
    } finally {
      setAdminLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!resumeText.trim()) { setError('Please upload a PDF or paste the resume text.'); return }
    if (!roleTitle.trim()) { setError('Role title is required.'); return }
    if (!jobDescription.trim()) { setError('Job description is required.'); return }
    if (!admin && remaining <= 0) { setError(`You've used all ${MAX_ANALYSES} free analyses. This is a portfolio demo — reach out for unlimited access!`); return }

    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const reqHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
      if (admin) reqHeaders['x-admin-key'] = getAdminKey()
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify({
          candidateName: candidateName.trim() || undefined,
          resumeText: resumeText.trim(),
          roleTitle: roleTitle.trim(),
          companyName: companyName.trim() || undefined,
          jobDescription: jobDescription.trim(),
          session_id: sessionId,
        }),
      })
      const data = await res.json()

      if (res.status === 429) {
        setRemaining(0)
        setStoredRemaining(0)
        setError(data.error || `You've used all ${MAX_ANALYSES} free analyses.`)
        return
      }

      if (!res.ok) throw new Error(data.error || `Analysis failed (${res.status})`)

      // Update remaining
      if (typeof data.remaining === 'number') {
        setRemaining(data.remaining)
        setStoredRemaining(data.remaining)
      }

      setResult(data as HsAnalysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div className="min-h-screen bg-bg-primary">
        {/* Sticky header */}
        <header className="border-b border-border-default bg-bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-bold text-text-primary text-sm">
                  Hire<span className="text-accent">Signal</span>
                </span>
              </div>
              {/* Subtitle hidden on mobile — prevents overflow at 390px */}
              <span className="hidden sm:block text-border-default">·</span>
              <span className="hidden sm:block text-xs text-text-muted font-mono truncate">AI Recruitment Intelligence</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              {/* Remaining badge — short on mobile */}
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full border flex-shrink-0 ${
                remaining > 0
                  ? 'text-text-muted border-border-default bg-bg-surface2/50'
                  : 'text-red-400 border-red-400/30 bg-red-400/10'
              }`}>
                {remaining > 0 ? (
                  <><span className="hidden sm:inline">Analyses </span>{remaining}<span className="hidden sm:inline"> left</span><span className="sm:hidden"> left</span></>
                ) : (
                  <><span className="hidden sm:inline">Limit reached</span><span className="sm:hidden">❌</span></>
                )}
              </span>

              {/* How It Works — icon on mobile, text+icon on desktop */}
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent border border-border-default hover:border-accent/30 px-2 py-1.5 rounded-lg transition-colors"
                title="How It Works"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="hidden sm:inline">How It Works</span>
              </button>

              {/* History — icon on mobile, text on desktop */}
              <Link
                href="/history"
                className="flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors"
              >
                <span className="hidden sm:inline">History</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page title */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Resume Analyzer</h1>
                <p className="mt-1.5 text-sm text-text-secondary leading-relaxed max-w-lg">
                  Upload a resume and job description. Get a match score, skills gap analysis, and improvement suggestions — in seconds.
                </p>
              </div>
              <Link
                href="/history"
                className="hidden sm:flex text-xs text-accent hover:text-accent-hover transition-colors items-center gap-1 self-start sm:pt-1 whitespace-nowrap"
              >
                View History →
              </Link>
            </div>
          </div>

          {/* Two-column on lg+, single column on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6 items-start">
            {/* Left — Form */}
            <div className="space-y-5">
              <div className="bg-bg-surface border border-border-default rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-accent/15 flex items-center justify-center text-accent text-xs font-bold">1</span>
                  Resume
                </h2>
                <ResumeUpload
                  candidateName={candidateName}
                  resumeText={resumeText}
                  onCandidateNameChange={setCandidateName}
                  onResumeTextChange={setResumeText}
                />
              </div>

              <div className="bg-bg-surface border border-border-default rounded-xl p-5">
                <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-accent/15 flex items-center justify-center text-accent text-xs font-bold">2</span>
                  Job Description
                </h2>
                <JobDescInput
                  roleTitle={roleTitle}
                  companyName={companyName}
                  jobDescription={jobDescription}
                  isAnalyzing={isAnalyzing}
                  error={error}
                  onRoleTitleChange={setRoleTitle}
                  onCompanyNameChange={setCompanyName}
                  onJobDescriptionChange={setJobDescription}
                  onLoadSample={handleLoadSample}
                  onSubmit={handleSubmit}
                />
              </div>
            </div>

            {/* Right — Skeleton / Results / Empty */}
            <div className="lg:sticky lg:top-20">
              {isAnalyzing ? (
                <AnalyzingSkeleton />
              ) : result ? (
                <ResultsPanel result={result} onReset={handleReset} />
              ) : (
                <div className="bg-bg-surface border border-border-default rounded-xl">
                  <EmptyResultsPlaceholder />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <footer className="border-t border-border-default py-4 text-center text-xs text-text-muted">
        <div>Built by <span className="text-text-secondary font-medium">Abrar Tajwar Khan</span></div>
        <div className="mt-1">
          {admin ? (
            <button
              onClick={() => { clearAdminKey(); setAdmin(false); setRemaining(getStoredRemaining()); }}
              style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', fontSize: '10px' }}
            >
              ✓ Admin active — click to disable
            </button>
          ) : (
            <button
              onClick={() => setShowAdminInput(true)}
              style={{ background: 'none', border: 'none', color: '#2d3548', cursor: 'pointer', fontSize: '10px' }}
            >
              Admin
            </button>
          )}
        </div>
      </footer>

      {showAdminInput && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => { setShowAdminInput(false); setAdminError(''); setAdminCode(''); }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: '14px', padding: '24px', maxWidth: '380px', width: '100%' }}
          >
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', marginBottom: '6px' }}>Are you the developer?</p>
            <p style={{ fontSize: '12px', color: '#475569', marginBottom: '16px' }}>Enter the secret code you set for unlimited testing.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="password"
                value={adminCode}
                onChange={(e) => { setAdminCode(e.target.value); setAdminError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') verifyAdmin(); }}
                placeholder="Secret code"
                autoFocus
                style={{ flex: 1, padding: '10px 14px', background: '#1a1f2e', border: '1px solid #252d3d', borderRadius: '8px', color: '#e2e8f0', fontSize: '13px' }}
              />
              <button
                onClick={verifyAdmin}
                disabled={!adminCode.trim() || adminLoading}
                style={{ padding: '10px 18px', background: '#818cf8', border: 'none', borderRadius: '8px', color: '#0f1117', fontWeight: 600, cursor: 'pointer', fontSize: '13px', opacity: (!adminCode.trim() || adminLoading) ? 0.5 : 1 }}
              >
                {adminLoading ? '...' : 'Verify'}
              </button>
            </div>
            {adminError && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '8px' }}>{adminError}</p>}
          </div>
        </div>
      )}

      <ToastContainer />
      {showModal && <HowItWorksModal onClose={() => setShowModal(false)} />}
    </>
  )
}
