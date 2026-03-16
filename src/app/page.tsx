'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { HsAnalysis } from '@/lib/supabase'
import ResumeUpload from '@/components/analyzer/ResumeUpload'
import JobDescInput, { SAMPLE_RESUME, SAMPLE_JD } from '@/components/analyzer/JobDescInput'
import ResultsPanel from '@/components/analyzer/ResultsPanel'
import { ToastContainer } from '@/components/ui/Toast'

function EmptyResultsPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      {/* Animated ring placeholder */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full border-2 border-dashed border-border-default flex items-center justify-center">
          <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        {/* Orbiting dots */}
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent/30 border border-accent/40" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-consider/30 border border-consider/40" />
      </div>

      <h3 className="text-base font-semibold text-text-primary mb-2">
        Your analysis will appear here
      </h3>
      <p className="text-sm text-text-muted leading-relaxed max-w-xs">
        Fill in the form and click{' '}
        <span className="text-accent font-medium">Analyze Match →</span> to get a match score,
        skills gap analysis, and resume improvements.
      </p>

      {/* Feature preview pills */}
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {['Match Score', 'Skills Gap', 'Keyword Gaps', 'Bullet Rewrites', 'Report Download'].map((f) => (
          <span
            key={f}
            className="px-2.5 py-1 rounded-full text-xs text-text-muted border border-border-default bg-bg-surface2/50"
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function AnalyzerPage() {
  // Form state
  const [candidateName, setCandidateName] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [jobDescription, setJobDescription] = useState('')

  // UI state
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<HsAnalysis | null>(null)

  const handleLoadSample = () => {
    setCandidateName('Sarah Chen')
    setResumeText(SAMPLE_RESUME)
    setRoleTitle('Senior Software Engineer')
    setCompanyName('Google')
    setJobDescription(SAMPLE_JD)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!resumeText.trim()) {
      setError('Please upload a PDF or paste the resume text.')
      return
    }
    if (!roleTitle.trim()) {
      setError('Role title is required.')
      return
    }
    if (!jobDescription.trim()) {
      setError('Job description is required.')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: candidateName.trim() || undefined,
          resumeText: resumeText.trim(),
          roleTitle: roleTitle.trim(),
          companyName: companyName.trim() || undefined,
          jobDescription: jobDescription.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Analysis failed (${res.status})`)
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
        {/* Header */}
        <header className="border-b border-border-default bg-bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-bold text-text-primary text-sm">
                  Hire<span className="text-accent">Signal</span>
                </span>
              </div>
              <span className="hidden sm:block text-border-default">·</span>
              <span className="hidden sm:block text-xs text-text-muted font-mono">AI Recruitment Intelligence</span>
            </div>
            <Link
              href="/history"
              className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1"
            >
              View History
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page title */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Resume Analyzer</h1>
                <p className="mt-1.5 text-sm text-text-secondary leading-relaxed max-w-lg">
                  Upload a resume and job description. Get a match score, skills gap analysis,
                  and improvement suggestions — in seconds.
                </p>
              </div>
              <Link
                href="/history"
                className="text-xs text-accent hover:text-accent-hover transition-colors flex items-center gap-1 self-start sm:pt-1"
              >
                View History →
              </Link>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6 items-start">
            {/* Left — Form */}
            <div className="space-y-5">
              {/* Resume upload card */}
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

              {/* Job description card */}
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

            {/* Right — Results */}
            <div className="lg:sticky lg:top-20">
              {result ? (
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

      <ToastContainer />
    </>
  )
}
