import { motion } from 'framer-motion'

// Animated voice waveform bars — signals a live call.
export function VoiceWave({ bars = 24, active = true, className = '' }: { bars?: number; active?: boolean; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-[3px] ${className}`}>
      {Array.from({ length: bars }).map((_, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-brand-600 to-brand-300"
          animate={
            active
              ? { height: [6, 10 + ((i * 7) % 20), 6] }
              : { height: 4 }
          }
          transition={{
            duration: 0.9 + (i % 5) * 0.12,
            repeat: active ? Infinity : 0,
            ease: 'easeInOut',
            delay: i * 0.04,
          }}
          style={{ height: 6 }}
        />
      ))}
    </div>
  )
}
