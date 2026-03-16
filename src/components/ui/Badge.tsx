'use client'

import { HTMLAttributes } from 'react'
import type { Recommendation } from '@/lib/supabase'

type BadgeVariant = 'hire' | 'consider' | 'pass' | 'accent' | 'default' | 'green' | 'red' | 'orange'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: 'sm' | 'md' | 'lg'
  recommendation?: Recommendation
}

const variantStyles: Record<BadgeVariant, string> = {
  hire: 'bg-hire/10 text-hire border border-hire/20',
  consider: 'bg-consider/10 text-consider border border-consider/20',
  pass: 'bg-pass/10 text-pass border border-pass/20',
  accent: 'bg-accent/10 text-accent border border-accent/20',
  default: 'bg-bg-surface2 text-text-secondary border border-border-default',
  green: 'bg-hire/10 text-hire border border-hire/20',
  red: 'bg-pass/10 text-pass border border-pass/20',
  orange: 'bg-consider/10 text-consider border border-consider/20',
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-4 py-1.5 text-sm',
}

export default function Badge({
  variant = 'default',
  size = 'md',
  recommendation,
  className = '',
  children,
  ...props
}: BadgeProps) {
  // If recommendation is provided, derive the variant
  const resolvedVariant: BadgeVariant = recommendation
    ? (recommendation.toLowerCase() as BadgeVariant)
    : variant

  return (
    <span
      className={`
        inline-flex items-center font-mono font-semibold rounded-full uppercase tracking-wider
        ${variantStyles[resolvedVariant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {recommendation ?? children}
    </span>
  )
}
