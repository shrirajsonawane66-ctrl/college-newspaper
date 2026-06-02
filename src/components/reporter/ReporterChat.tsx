'use client'
import { useRef, useEffect } from 'react'
import type { AIState } from '@/lib/speech'

interface Message {
  role: 'user' | 'nova'
  text: string
}

interface ReporterChatProps {
  messages: Message[]
  aiState: AIState
}

export function ReporterChat({ messages, aiState }: ReporterChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div
      ref={scrollRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      {messages.length === 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'rgba(255,255,255,0.2)',
          fontSize: '12px',
          fontFamily: 'var(--font-inter)',
        }}>
          Speak or type to talk with NOVA
        </div>
      )}

      {messages.map((msg, i) => (
        <div
          key={i}
          style={{
            padding: '8px 12px',
            borderRadius: '12px',
            fontSize: '13px',
            lineHeight: 1.5,
            maxWidth: '85%',
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            background: msg.role === 'user'
              ? 'rgba(79, 195, 247, 0.12)'
              : 'rgba(255, 255, 255, 0.04)',
            border: msg.role === 'user'
              ? '1px solid rgba(79, 195, 247, 0.15)'
              : '1px solid rgba(255, 255, 255, 0.06)',
            color: msg.role === 'user' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.85)',
            borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
            borderBottomLeftRadius: msg.role === 'nova' ? '4px' : '12px',
            fontFamily: msg.role === 'nova'
              ? 'var(--font-source-serif), Georgia, serif'
              : 'var(--font-inter), system-ui, sans-serif',
            animation: 'novaFadeIn 0.3s ease',
          }}
        >
          {msg.text}
        </div>
      ))}

      {aiState === 'thinking' && (
        <div style={{
          padding: '8px 12px',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.4)',
          fontStyle: 'italic',
          fontFamily: 'var(--font-source-serif), Georgia, serif',
          alignSelf: 'flex-start',
          display: 'flex',
          gap: '4px',
        }}>
          <span>Thinking</span>
          <span style={{ animation: 'novaDot 1.4s infinite' }}>.</span>
          <span style={{ animation: 'novaDot 1.4s 0.2s infinite' }}>.</span>
          <span style={{ animation: 'novaDot 1.4s 0.4s infinite' }}>.</span>
        </div>
      )}

      <style>{`
        @keyframes novaFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes novaDot {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
