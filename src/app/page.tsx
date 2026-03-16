export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono font-semibold uppercase tracking-wider mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          AI Recruitment Intelligence
        </div>
        <h1 className="text-4xl font-bold text-text-primary">
          Hire<span className="text-gradient-accent">Signal</span>
        </h1>
        <p className="text-text-secondary text-sm max-w-sm mx-auto">
          Upload a resume + paste a job description. Claude analyzes the match in seconds.
        </p>
        <p className="text-text-muted text-xs font-mono">Phase 1 — Foundation ✓</p>
      </div>
    </main>
  )
}
