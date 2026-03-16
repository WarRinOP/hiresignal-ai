'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

// Sample data for demo
export const SAMPLE_RESUME = `Sarah Chen — Software Engineer

EXPERIENCE
Senior Software Engineer | TechCorp | 2021–Present
• Led team of 3 engineers building microservices handling 500k+ daily users
• Architected PostgreSQL-backed data pipeline reducing query time by 60%
• Deployed containerized services using Docker on AWS ECS

Software Engineer | StartupXYZ | 2019–2021
• Built React/TypeScript frontend serving 50k monthly active users
• Designed RESTful Node.js APIs integrated with third-party payment systems
• Implemented CI/CD pipeline with GitHub Actions reducing deployment time by 40%

SKILLS
React, TypeScript, Node.js, PostgreSQL, Docker, AWS (EC2, ECS, RDS), Redis, REST APIs, GraphQL, Git

EDUCATION
BSc Computer Science — State University — 2019

CERTIFICATIONS
AWS Certified Solutions Architect – Associate`

export const SAMPLE_JD = `Senior Software Engineer — Google

About the role:
We're looking for a Senior Software Engineer to join our infrastructure team. You will design, build, and scale distributed systems that power Google's core products.

Requirements:
• 5+ years of software engineering experience
• Proficiency in Go or Python (primary languages)
• Experience with Kubernetes and container orchestration at scale
• Strong background in distributed systems and system design
• Microservices architecture experience
• Experience with large-scale data processing

Nice to have:
• Machine learning or ML infrastructure experience
• Open source contributions
• Experience with gRPC, protocol buffers
• Background in site reliability engineering (SRE)

We offer competitive compensation, comprehensive benefits, and the opportunity to work on systems used by billions.`

interface JobDescInputProps {
  roleTitle: string
  companyName: string
  jobDescription: string
  isAnalyzing: boolean
  error: string | null
  onRoleTitleChange: (v: string) => void
  onCompanyNameChange: (v: string) => void
  onJobDescriptionChange: (v: string) => void
  onLoadSample: () => void
  onSubmit: () => void
}

export default function JobDescInput({
  roleTitle,
  companyName,
  jobDescription,
  isAnalyzing,
  error,
  onRoleTitleChange,
  onCompanyNameChange,
  onJobDescriptionChange,
  onLoadSample,
  onSubmit,
}: JobDescInputProps) {
  const [jdFocused, setJdFocused] = useState(false)

  const inputClass =
    'w-full px-3 py-2 text-sm bg-bg-surface2 border border-border-default rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors'

  return (
    <div className="space-y-4">
      {/* Role title (required) */}
      <div>
        <label className="label-caps block mb-1.5">
          Role Title <span className="text-pass normal-case font-normal">*</span>
        </label>
        <input
          type="text"
          value={roleTitle}
          onChange={(e) => onRoleTitleChange(e.target.value)}
          placeholder="e.g. Senior Software Engineer"
          required
          className={inputClass}
        />
      </div>

      {/* Company name (optional) */}
      <div>
        <label className="label-caps block mb-1.5">Company Name</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => onCompanyNameChange(e.target.value)}
          placeholder="e.g. Google"
          className={inputClass}
        />
      </div>

      {/* Job description */}
      <div>
        <label className="label-caps block mb-1.5">
          Job Description <span className="text-pass normal-case font-normal">*</span>
        </label>
        <div className="relative">
          <textarea
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            onFocus={() => setJdFocused(true)}
            onBlur={() => setJdFocused(false)}
            placeholder="Paste the full job description..."
            rows={8}
            className={`${inputClass} resize-none leading-relaxed`}
            style={{ minHeight: '200px' }}
          />
          <span className="absolute bottom-3 right-3 text-xs text-text-muted font-mono pointer-events-none">
            {jdFocused || jobDescription.length > 0 ? jobDescription.length.toLocaleString() : ''}
          </span>
        </div>
      </div>

      {/* Analyze button */}
      <Button
        variant="primary"
        size="lg"
        onClick={onSubmit}
        loading={isAnalyzing}
        disabled={isAnalyzing || !roleTitle.trim() || (!jobDescription.trim())}
        className="w-full"
      >
        {isAnalyzing ? 'Analyzing with Claude...' : 'Analyze Match →'}
      </Button>

      {/* Load sample link */}
      <div className="text-center">
        <button
          type="button"
          onClick={onLoadSample}
          className="text-xs text-text-muted hover:text-accent transition-colors underline underline-offset-2"
        >
          Load sample data (Sarah Chen / Google SWE)
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-pass/10 border border-pass/20">
          <svg
            className="w-4 h-4 text-pass flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-xs font-semibold text-pass">Analysis Failed</p>
            <p className="text-xs text-pass/80 mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
