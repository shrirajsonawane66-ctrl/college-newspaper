'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { generateNovaResponse, type ArticleContext } from '@/lib/gemini'
import { createSpeechManager, type AIState } from '@/lib/speech'
import { ReporterCanvas } from './ReporterCanvas'
import { ReporterWaveform } from './ReporterWaveform'

type Message = {
  role: 'user' | 'nova'
  text: string
}

export function AIReporterWidget() {
  const speech = useMemo(() => createSpeechManager(), [])
  const [aiState, setAiState] = useState<AIState>('idle')
  const [messages, setMessages] = useState<Message[]>([])
  const [lastHeard, setLastHeard] = useState('')
  const transcriptTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingTranscript = useRef('')

  const askNova = useCallback(async (text: string) => {
    if (!text || speech.getState() === 'thinking') return
    pendingTranscript.current = ''
    setLastHeard('')
    speech.stopListening()
    setAiState('thinking')
    setMessages((current) => [...current.slice(-3), { role: 'user', text }])

    const reply = await generateNovaResponse(text)
    setMessages((current) => [...current.slice(-4), { role: 'nova', text: reply }])
    speech.speak(reply)
  }, [speech])

  useEffect(() => {
    const offState = speech.onStateChange(setAiState)
    const offTranscript = speech.onTranscript((text) => {
      pendingTranscript.current = text.trim()
      setLastHeard(text.trim())

      if (transcriptTimer.current) clearTimeout(transcriptTimer.current)
      transcriptTimer.current = setTimeout(() => {
        const finalText = pendingTranscript.current
        if (finalText) askNova(finalText).catch(() => {})
      }, 900)
    })

    const onToggleMic = () => {
      if (speech.getState() === 'listening') speech.stopListening()
      else speech.startListening()
    }

    const onReadArticle = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (!detail?.title) return
      if (speech.getState() === 'thinking' || speech.getState() === 'speaking') return
      speech.stopListening()
      setAiState('thinking')
      const ctx: ArticleContext = {
        title: detail.title,
        summary: detail.summary,
        content: detail.content,
        source: detail.category,
      }
      generateNovaResponse(`Read this article aloud for me: ${detail.title}`, ctx).then((reply) => {
        setMessages((current) => [...current.slice(-4), { role: 'nova', text: reply }])
        speech.speak(reply)
      }).catch(() => {})
    }

    window.addEventListener('nova-toggle-mic', onToggleMic)
    window.addEventListener('nova-read-article', onReadArticle)
    return () => {
      if (transcriptTimer.current) clearTimeout(transcriptTimer.current)
      window.removeEventListener('nova-toggle-mic', onToggleMic)
      window.removeEventListener('nova-read-article', onReadArticle)
      offState()
      offTranscript()
      speech.cleanup()
    }
  }, [askNova, speech])

  const active = aiState === 'listening' || aiState === 'speaking' || aiState === 'thinking'
  const latestMessage = lastHeard || messages.at(-1)?.text || 'Tap the mic to talk'

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '8px',
        right: '16px',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div
        className="nova-character-container"
        style={{
          position: 'relative',
          width: 'clamp(190px, 24vw, 340px)',
          height: 'clamp(320px, 48vh, 560px)',
        }}
      >
        <ReporterCanvas aiState={aiState} />

        <div
          aria-live="polite"
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '66px',
            transform: 'translateX(-50%)',
            width: 'min(260px, 88%)',
            padding: '8px 10px',
            borderRadius: '8px',
            background: 'rgba(253, 250, 240, 0.86)',
            color: '#1e1e1e',
            boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            fontSize: '12px',
            lineHeight: 1.35,
            opacity: active || messages.length > 0 ? 1 : 0.68,
            pointerEvents: 'none',
            transition: 'opacity 0.2s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              marginBottom: active ? '4px' : 0,
            }}
          >
            <span style={{ fontWeight: 700 }}>
              {aiState === 'listening' ? 'Listening' : aiState === 'thinking' ? 'Thinking' : aiState === 'speaking' ? 'Speaking' : 'NOVA'}
            </span>
            <ReporterWaveform active={active} count={14} />
          </div>
          <div
            style={{
              maxHeight: '42px',
              overflow: 'hidden',
              color: '#3a3a3a',
            }}
          >
            {latestMessage}
          </div>
        </div>

        <button
          onClick={() => { window.dispatchEvent(new CustomEvent('nova-toggle-mic')) }}
          style={{
            position: 'absolute',
            bottom: '18px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '1px solid rgba(30, 30, 30, 0.12)',
            background: aiState === 'listening' ? '#1e1e1e' : 'rgba(253, 250, 240, 0.9)',
            cursor: 'pointer',
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: '0 10px 24px rgba(0,0,0,0.16)',
            transition: 'transform 0.2s ease, background 0.2s ease',
            padding: 0,
            zIndex: 1,
          }}
          title="Talk to NOVA"
          aria-label="Activate microphone"
        >
          {aiState === 'listening'
            ? <MicOff size={20} color="#fdfaf0" strokeWidth={2.2} />
            : <Mic size={20} color="#1e1e1e" strokeWidth={2.2} />}
        </button>
      </div>
    </div>
  )
}
