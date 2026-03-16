'use client'

import { useEffect, useRef, useState } from 'react'

interface ProgressRingProps {
  value: number // 0-100
  size?: number
  strokeWidth?: number
  animate?: boolean
  showLabel?: boolean
  className?: string
}

function getColor(value: number): string {
  if (value >= 70) return '#22c55e'  // hire green
  if (value >= 40) return '#f59e0b'  // consider orange
  return '#ef4444'                   // pass red
}

export default function ProgressRing({
  value,
  size = 120,
  strokeWidth = 8,
  animate = true,
  showLabel = true,
  className = '',
}: ProgressRingProps) {
  const [displayed, setDisplayed] = useState(animate ? 0 : value)
  const animRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const DURATION = 1000

  useEffect(() => {
    if (!animate) {
      setDisplayed(value)
      return
    }

    const start = performance.now()
    startRef.current = value

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / DURATION, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * value))

      if (progress < 1) {
        animRef.current = requestAnimationFrame(tick)
      }
    }

    animRef.current = requestAnimationFrame(tick)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [value, animate])

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayed / 100) * circumference
  const color = getColor(value)
  const center = size / 2
  const fontSize = size * 0.22

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg]"
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
          style={{ transition: animate ? 'none' : undefined, filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-mono font-bold tabular-nums"
            style={{ fontSize, color, lineHeight: 1 }}
          >
            {displayed}%
          </span>
        </div>
      )}
    </div>
  )
}
