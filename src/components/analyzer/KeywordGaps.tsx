'use client'

interface KeywordGapsProps {
  keywordGaps: string[]
}

export default function KeywordGaps({ keywordGaps }: KeywordGapsProps) {
  return (
    <div>
      <div className="mb-3">
        <p className="label-caps">Keyword Gaps</p>
        <p className="text-xs text-text-muted mt-0.5">
          Add these keywords to your resume to improve ATS match
        </p>
      </div>

      {keywordGaps.length === 0 ? (
        <div className="flex items-center gap-2 text-hire text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          No keyword gaps found
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {keywordGaps.map((gap) => (
            <span
              key={gap}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-consider/10 text-consider border border-consider/20"
            >
              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {gap}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
