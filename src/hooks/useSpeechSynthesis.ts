'use client'
import { useState, useCallback, useRef, useEffect } from 'react'

export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false)
  const [supported, setSupported] = useState(false)
  const [voicesLoaded, setVoicesLoaded] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const preferredVoiceRef = useRef<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
  }, [])

  useEffect(() => {
    if (!supported) return
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      preferredVoiceRef.current = voices.find(v => v.name.includes('Google UK') || v.name.includes('Microsoft David')) ?? null
      setVoicesLoaded(true)
    }
    const onVoicesChanged = () => {
      const updated = window.speechSynthesis.getVoices()
      preferredVoiceRef.current = updated.find(v => v.name.includes('Google UK') || v.name.includes('Microsoft David')) ?? null
      setVoicesLoaded(true)
    }
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
  }, [supported])

  const speak = useCallback((text: string) => {
    if (!supported) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    if (preferredVoiceRef.current) utterance.voice = preferredVoiceRef.current

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [supported])

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  const stop = cancel

  return { speak, cancel, stop, speaking, supported }
}
