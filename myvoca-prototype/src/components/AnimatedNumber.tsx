import { useEffect, useRef } from 'react'
import { animate, useInView, useMotionValue, useTransform, motion } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  decimals?: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}

export function AnimatedNumber({
  value,
  decimals = 0,
  suffix = '',
  prefix = '',
  duration = 1.6,
  className = '',
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const motionValue = useMotionValue(0)
  const rendered = useTransform(motionValue, (v) =>
    `${prefix}${v.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`,
  )

  useEffect(() => {
    if (inView) {
      const controls = animate(motionValue, value, { duration, ease: [0.22, 1, 0.36, 1] })
      return controls.stop
    }
  }, [inView, value, duration, motionValue])

  return (
    <motion.span ref={ref} className={`tabular-nums ${className}`}>
      {rendered}
    </motion.span>
  )
}
