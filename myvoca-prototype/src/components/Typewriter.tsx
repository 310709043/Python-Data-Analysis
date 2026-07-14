import { useEffect, useState } from 'react'

interface TypewriterProps {
  text: string
  speed?: number
  onDone?: () => void
  className?: string
}

export function Typewriter({ text, speed = 45, onDone, className = '' }: TypewriterProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(0)
    const timer = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(timer)
          return c
        }
        return c + 1
      })
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])

  const done = count >= text.length
  useEffect(() => {
    if (done && onDone) onDone()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  return (
    <span className={className}>
      {text.slice(0, count)}
      {!done && <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-brand-400 align-middle" />}
    </span>
  )
}
