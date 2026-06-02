'use client'

export type AIState = 'idle' | 'listening' | 'thinking' | 'speaking'

type StateCallback = (state: AIState) => void
type TranscriptCallback = (text: string) => void

interface SpeechRecognitionResult {
  0: { transcript: string }
  length: number
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResult[]
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition
}

interface SpeechRecognition {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

export function createSpeechManager() {
  let synthesisState: AIState = 'idle'
  let recognitionInstance: SpeechRecognition | null = null
  let utterance: SpeechSynthesisUtterance | null = null
  const stateListeners: StateCallback[] = []
  const transcriptListeners: TranscriptCallback[] = []

  function setState(s: AIState) {
    synthesisState = s
    stateListeners.forEach((fn) => fn(s))
  }

  function onStateChange(fn: StateCallback) {
    stateListeners.push(fn)
    return () => {
      const i = stateListeners.indexOf(fn)
      if (i >= 0) stateListeners.splice(i, 1)
    }
  }

  function onTranscript(fn: TranscriptCallback) {
    transcriptListeners.push(fn)
    return () => {
      const i = transcriptListeners.indexOf(fn)
      if (i >= 0) transcriptListeners.splice(i, 1)
    }
  }

  const speechSupported = () =>
    typeof window !== 'undefined' && 'speechSynthesis' in window

  const getSpeechRecognitionAPI = (): SpeechRecognitionConstructor | null => {
    if (typeof window === 'undefined') return null
    const w = window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }
    return w.SpeechRecognition || w.webkitSpeechRecognition || null
  }

  function speak(text: string) {
    if (!speechSupported()) return
    window.speechSynthesis.cancel()
    setState('speaking')
    utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(
      (v) => v.name.includes('Google UK') || v.name.includes('Microsoft David') || v.name.includes('Microsoft Mark')
    )
    if (preferred) utterance.voice = preferred

    utterance.onend = () => setState('idle')
    utterance.onerror = () => setState('idle')
    window.speechSynthesis.speak(utterance)
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel()
    setState('idle')
  }

  function startListening() {
    const SpeechRecognitionAPI = getSpeechRecognitionAPI()
    if (!SpeechRecognitionAPI) return
    stopSpeaking()

    recognitionInstance = new SpeechRecognitionAPI()
    recognitionInstance.continuous = false
    recognitionInstance.interimResults = true
    recognitionInstance.lang = 'en-US'

    setState('listening')

    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1
      const transcript = event.results[last][0].transcript
      transcriptListeners.forEach((fn) => fn(transcript))
    }

    recognitionInstance.onend = () => {
      if (synthesisState === 'listening') setState('idle')
    }

    recognitionInstance.onerror = () => {
      setState('idle')
    }

    try {
      recognitionInstance.start()
    } catch {
      setState('idle')
    }
  }

  function stopListening() {
    if (recognitionInstance) {
      try { recognitionInstance.stop() } catch {}
      recognitionInstance = null
    }
    if (synthesisState === 'listening') setState('idle')
  }

  function getState() {
    return synthesisState
  }

  function cleanup() {
    stopSpeaking()
    stopListening()
    stateListeners.length = 0
    transcriptListeners.length = 0
  }

  return {
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    onStateChange,
    onTranscript,
    getState,
    speechSupported,
    cleanup,
  }
}

export type SpeechManager = ReturnType<typeof createSpeechManager>
