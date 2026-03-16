'use client'

import type { BulletRewrite } from '@/lib/supabase'

interface BulletRewriterProps {
  bulletRewrites: BulletRewrite[]
}

function ArrowDown() {
  return (
    <div className="flex items-center justify-center py-2">
      <svg
        className="w-5 h-5 text-accent"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

function RewriteItem({ rewrite, isLast }: { rewrite: BulletRewrite; isLast: boolean }) {
  return (
    <div className={`py-5 ${!isLast ? 'border-b border-border-default' : ''}`}>
      {/* Original */}
      <p className="label-caps text-text-muted mb-1.5">Original</p>
      <div className="rounded-lg px-4 py-3 text-sm text-text-secondary leading-relaxed" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {rewrite.original}
      </div>

      <ArrowDown />

      {/* Improved */}
      <p className="label-caps text-accent mb-1.5">Improved</p>
      <div className="rounded-lg px-4 py-3 text-sm text-text-primary leading-relaxed" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
        {rewrite.rewritten}
      </div>

      {/* Reason */}
      <p className="mt-2.5 text-xs text-text-muted italic leading-relaxed">
        {rewrite.reason}
      </p>
    </div>
  )
}

export default function BulletRewriter({ bulletRewrites }: BulletRewriterProps) {
  if (!bulletRewrites || bulletRewrites.length === 0) return null

  return (
    <div>
      {bulletRewrites.map((rewrite, i) => (
        <RewriteItem
          key={i}
          rewrite={rewrite}
          isLast={i === bulletRewrites.length - 1}
        />
      ))}
    </div>
  )
}
