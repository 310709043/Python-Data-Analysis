import { useCallback, useEffect, useRef, useState } from 'react'

// The Web Speech API isn't in TS's default DOM lib, so the constructor and
// event shapes are typed loosely here rather than leaking `any` to callers.
interface SpeechRecognitionResultLike {
  isFinal: boolean
  0: { transcript: string }
}
interface SpeechRecognitionEventLike {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}
interface SpeechRecognitionErrorEventLike {
  error: string
}
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function useSpeechRecognition(onFinalResult: (text: string) => void, lang = 'zh-TW') {
  const [supported] = useState(() => getSpeechRecognitionCtor() !== null)
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const onFinalResultRef = useRef(onFinalResult)
  onFinalResultRef.current = onFinalResult

  useEffect(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) return
    const recognition = new Ctor()
    recognition.lang = lang
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) final += result[0].transcript
        else interim += result[0].transcript
      }
      if (interim) setInterimText(interim)
      if (final.trim()) {
        setInterimText('')
        onFinalResultRef.current(final.trim())
      }
    }
    recognition.onerror = (event) => {
      setError(event.error === 'not-allowed' ? '麥克風權限被拒絕，請允許存取後再試一次' : `語音辨識錯誤（${event.error}）`)
      setIsListening(false)
    }
    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    return () => recognition.abort()
  }, [lang])

  const start = useCallback(() => {
    if (!recognitionRef.current) return
    setError(null)
    setInterimText('')
    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch {
      // start() throws if already listening — ignore, state stays consistent
    }
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  return { supported, isListening, interimText, error, start, stop }
}
