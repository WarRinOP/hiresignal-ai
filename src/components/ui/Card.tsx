'use client'

import { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  children: ReactNode
  padding?: 'sm' | 'md' | 'lg' | 'none'
  hover?: boolean
}

export default function Card({
  title,
  subtitle,
  children,
  padding = 'md',
  hover = false,
  className = '',
  ...props
}: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  }

  return (
    <div
      className={`
        bg-bg-surface border border-border-default rounded-xl
        ${hover ? 'hover:border-border-hover transition-colors cursor-pointer' : ''}
        ${paddings[padding]}
        ${className}
      `}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          )}
          {subtitle && (
            <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
