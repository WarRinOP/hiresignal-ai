'use client'

import { useEffect, useRef, useState } from 'react'

interface MatchRingProps {
  score: number
  size?: number
}

function getScoreColor(score: number): string {
  if (score >= 70) return '#22c55e'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

function getScoreGlow(score: number): string {
  if (score >= 70) return 'rgba(34,197,94,0.25)'
  if (score >= 40) return 'rgba(245,158,11,0.25)'
  return 'rgba(239,68,68,0.25)'
}

export default function MatchRing({ score, size = 120 }: MatchRingProps) {
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef<number | null>(null)
  const DURATION = 1000

  useEffect(() => {
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / DURATION, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * score))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [score])

  const strokeWidth = size * 0.075
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayed / 100) * circumference
  const center = size / 2
  const color = getScoreColor(score)
  const glow = getScoreGlow(score)

  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#222731"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ filter: `drop-shadow(0 0 8px ${glow})` }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-mono font-bold tabular-nums leading-none"
            style={{ fontSize: size * 0.2, color }}
          >
            {displayed}%
          </span>
          <span
            className="font-mono text-text-muted leading-none mt-0.5"
            style={{ fontSize: size * 0.09 }}
          >
            match
          </span>
        </div>
      </div>
    </div>
  )
}
