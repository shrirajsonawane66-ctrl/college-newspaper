'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

function hasWebGLSupport(): boolean {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

const AIReporterWidget = dynamic(
  () => import('./AIReporterWidget').then((m) => m.AIReporterWidget),
  { ssr: false }
)

export function ReporterWidgetWrapper() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(hasWebGLSupport())
  }, [])

  if (!show) return null

  return (
    <ErrorBoundary>
      <AIReporterWidget />
    </ErrorBoundary>
  )
}
