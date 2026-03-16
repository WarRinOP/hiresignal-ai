'use client'

import type { Recommendation } from '@/lib/supabase'

interface RecommendationBadgeProps {
  recommendation: Recommendation
}

const config: Record<
  Recommendation,
  { label: string; bg: string; text: string; border: string; glow: string }
> = {
  Hire: {
    label: 'HIRE',
    bg: 'rgba(34,197,94,0.12)',
    text: '#22c55e',
    border: 'rgba(34,197,94,0.3)',
    glow: 'rgba(34,197,94,0.1)',
  },
  Consider: {
    label: 'CONSIDER',
    bg: 'rgba(245,158,11,0.12)',
    text: '#f59e0b',
    border: 'rgba(245,158,11,0.3)',
    glow: 'rgba(245,158,11,0.1)',
  },
  Pass: {
    label: 'PASS',
    bg: 'rgba(239,68,68,0.12)',
    text: '#ef4444',
    border: 'rgba(239,68,68,0.3)',
    glow: 'rgba(239,68,68,0.1)',
  },
}

export default function RecommendationBadge({ recommendation }: RecommendationBadgeProps) {
  const c = config[recommendation]

  return (
    <div
      className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full font-mono font-bold tracking-widest text-base uppercase"
      style={{
        background: c.bg,
        color: c.text,
        border: `1.5px solid ${c.border}`,
        boxShadow: `0 0 20px ${c.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {/* Pulsing dot */}
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: c.text, boxShadow: `0 0 6px ${c.text}` }}
      />
      {c.label}
    </div>
  )
}
