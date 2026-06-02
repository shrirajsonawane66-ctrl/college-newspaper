'use client'
import { useMemo } from 'react'

interface ReporterWaveformProps {
  active: boolean
  count?: number
}

export function ReporterWaveform({ active, count = 24 }: ReporterWaveformProps) {
  const bars = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      height: 0.15 + Math.sin((i / count) * Math.PI) * 0.6,
      delay: i * 0.06,
    })),
  [count])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      height: '28px',
    }}>
      {bars.map((bar, i) => (
        <div
          key={i}
          style={{
            width: '3px',
            height: active ? `${bar.height * 100}%` : '15%',
            borderRadius: '2px',
            background: active
              ? 'linear-gradient(to top, #4fc3f7, #e040fb)'
              : 'rgba(79, 195, 247, 0.15)',
            transition: 'height 0.15s ease',
            animation: active
              ? `nova-waveform-bar 0.8s ease-in-out ${bar.delay}s infinite`
              : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes nova-waveform-bar {
          0%, 100% { height: 15%; }
          30% { height: 92%; }
          60% { height: 42%; }
        }
      `}</style>
    </div>
  )
}
