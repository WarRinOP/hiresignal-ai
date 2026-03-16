'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  id: string
  message: string
  type?: 'success' | 'error' | 'info'
  onDismiss: (id: string) => void
}

function ToastItem({ id, message, type = 'info', onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 4000)
    return () => clearTimeout(timer)
  }, [id, onDismiss])

  const styles = {
    success: 'border-hire/30 bg-hire/10 text-hire',
    error: 'border-pass/30 bg-pass/10 text-pass',
    info: 'border-accent/30 bg-accent/10 text-text-primary',
  }

  const icons = {
    success: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border 
        bg-bg-surface shadow-xl text-sm font-medium
        animate-fade-in-up min-w-[280px] max-w-[380px]
        ${styles[type]}
      `}
    >
      {icons[type]}
      <span className="flex-1 text-text-primary">{message}</span>
      <button
        onClick={() => onDismiss(id)}
        className="text-text-muted hover:text-text-primary transition-colors ml-1"
        aria-label="Dismiss"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// ─── Toast Manager ─────────────────────────────────────────────────────────

export interface ToastMessage {
  id: string
  message: string
  type?: 'success' | 'error' | 'info'
}

let toastListeners: Array<(toasts: ToastMessage[]) => void> = []
let toastsState: ToastMessage[] = []

function notify(toasts: ToastMessage[]) {
  toastsState = toasts
  toastListeners.forEach((fn) => fn(toastsState))
}

export const toast = {
  success: (message: string) => {
    const id = Math.random().toString(36).slice(2)
    notify([...toastsState, { id, message, type: 'success' }])
  },
  error: (message: string) => {
    const id = Math.random().toString(36).slice(2)
    notify([...toastsState, { id, message, type: 'error' }])
  },
  info: (message: string) => {
    const id = Math.random().toString(36).slice(2)
    notify([...toastsState, { id, message, type: 'info' }])
  },
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>(toastsState)

  useEffect(() => {
    const handler = (updated: ToastMessage[]) => setToasts([...updated])
    toastListeners.push(handler)
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== handler)
    }
  }, [])

  const dismiss = (id: string) => {
    notify(toastsState.filter((t) => t.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onDismiss={dismiss} />
      ))}
    </div>
  )
}
