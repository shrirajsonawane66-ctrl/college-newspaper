'use client'
import dynamic from 'next/dynamic'

const AIReporterWidget = dynamic(
  () => import('./AIReporterWidget').then((m) => m.AIReporterWidget),
  { ssr: false }
)

export function ReporterWidgetWrapper() {
  return <AIReporterWidget />
}
