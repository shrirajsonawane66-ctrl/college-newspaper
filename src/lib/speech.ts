'use client'

export type AIState = 'idle' | 'listening' | 'thinking' | 'speaking'

type StateCallback = (state: AIState) => void
type TranscriptCallback = (text: string) => void

export function createSpeechManager() {
  let synthesisState: AIState = 'idle'
  let recognition: any = null
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

  const recognitionSupported = () =>
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in (window as any) || 'webkitSpeechRecognition' in window)

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
    if (!recognitionSupported()) return
    stopSpeaking()
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionAPI) return

    recognition = new SpeechRecognitionAPI()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    setState('listening')

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1
      const transcript = event.results[last][0].transcript
      transcriptListeners.forEach((fn) => fn(transcript))
    }

    recognition.onend = () => {
      if (synthesisState === 'listening') setState('idle')
    }

    recognition.onerror = () => {
      setState('idle')
    }

    try {
      recognition.start()
    } catch {
      setState('idle')
    }
  }

  function stopListening() {
    if (recognition) {
      try { recognition.stop() } catch {}
      recognition = null
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
    recognitionSupported,
    cleanup,
  }
}

export type SpeechManager = ReturnType<typeof createSpeechManager>
