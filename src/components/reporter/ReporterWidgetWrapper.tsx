'use client'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

const AIReporterWidget = dynamic(
  () => import('./AIReporterWidget').then((m) => m.AIReporterWidget),
  { ssr: false }
)

export function ReporterWidgetWrapper() {
  return (
    <ErrorBoundary>
      <AIReporterWidget />
    </ErrorBoundary>
  )
}
