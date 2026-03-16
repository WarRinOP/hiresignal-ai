'use client'

import { useCallback, useRef, useState } from 'react'

type InputMode = 'upload' | 'paste'

interface ResumeUploadProps {
  candidateName: string
  resumeText: string
  onCandidateNameChange: (name: string) => void
  onResumeTextChange: (text: string) => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ResumeUpload({
  candidateName,
  resumeText,
  onCandidateNameChange,
  onResumeTextChange,
}: ResumeUploadProps) {
  const [mode, setMode] = useState<InputMode>('upload')
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<number>(0)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateAndParseFile = useCallback(
    async (file: File) => {
      setParseError(null)

      // Validate type
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        setParseError('Only PDF files are accepted.')
        return
      }

      // Validate size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setParseError('File exceeds 5MB limit. Please upload a smaller PDF.')
        return
      }

      setFileName(file.name)
      setFileSize(file.size)
      setParsing(true)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/parse-pdf', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to parse PDF')

        onResumeTextChange(data.text)
      } catch (err) {
        setParseError(err instanceof Error ? err.message : 'Failed to parse PDF')
        setFileName(null)
      } finally {
        setParsing(false)
      }
    },
    [onResumeTextChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) validateAndParseFile(file)
    },
    [validateAndParseFile]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) validateAndParseFile(file)
    },
    [validateAndParseFile]
  )

  const tabStyle = (active: boolean) =>
    `px-4 py-2 text-xs font-semibold transition-all rounded-md ${
      active
        ? 'bg-accent/15 text-accent border border-accent/25'
        : 'text-text-muted hover:text-text-secondary border border-transparent'
    }`

  return (
    <div className="space-y-4">
      {/* Candidate name */}
      <div>
        <label className="label-caps block mb-1.5">Candidate Name</label>
        <input
          type="text"
          value={candidateName}
          onChange={(e) => onCandidateNameChange(e.target.value)}
          placeholder="Candidate name (optional)"
          className="w-full px-3 py-2 text-sm bg-bg-surface2 border border-border-default rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
        />
      </div>

      {/* Tab switcher */}
      <div>
        <div className="flex gap-1 mb-3 p-1 bg-bg-surface2 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={tabStyle(mode === 'upload')}
          >
            Upload PDF
          </button>
          <button
            type="button"
            onClick={() => setMode('paste')}
            className={tabStyle(mode === 'paste')}
          >
            Paste Text
          </button>
        </div>

        {/* Upload tab */}
        {mode === 'upload' && (
          <div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                transition-all duration-200 min-h-[160px] flex flex-col items-center justify-center gap-3
                ${dragOver
                  ? 'border-accent bg-accent/5'
                  : fileName
                  ? 'border-hire/40 bg-hire/5'
                  : 'border-border-default hover:border-border-hover bg-bg-surface2/50 hover:bg-bg-surface2'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {parsing ? (
                <>
                  <svg className="animate-spin w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-sm text-text-secondary">Parsing PDF...</p>
                </>
              ) : fileName ? (
                <>
                  <div className="w-10 h-10 rounded-lg bg-hire/15 flex items-center justify-center">
                    <svg className="w-5 h-5 text-hire" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{fileName}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {formatBytes(fileSize)}
                      {resumeText && ` · ${resumeText.length.toLocaleString()} characters extracted`}
                    </p>
                  </div>
                  <p className="text-xs text-text-muted">Click to replace</p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-lg bg-bg-surface border border-border-default flex items-center justify-center">
                    <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.1a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">
                      Drop PDF here or <span className="text-accent">click to browse</span>
                    </p>
                    <p className="text-xs text-text-muted mt-1">PDF only · max 5MB</p>
                  </div>
                </>
              )}
            </div>

            {parseError && (
              <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg bg-pass/10 border border-pass/20">
                <svg className="w-4 h-4 text-pass flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-pass">{parseError}</p>
              </div>
            )}
          </div>
        )}

        {/* Paste tab */}
        {mode === 'paste' && (
          <div className="relative">
            <textarea
              value={resumeText}
              onChange={(e) => onResumeTextChange(e.target.value)}
              placeholder="Paste resume content here..."
              rows={8}
              className="w-full px-4 py-3 text-sm bg-bg-surface2 border border-border-default rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors resize-none leading-relaxed"
              style={{ minHeight: '200px' }}
            />
            <span className="absolute bottom-3 right-3 text-xs text-text-muted font-mono pointer-events-none">
              {resumeText.length.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
