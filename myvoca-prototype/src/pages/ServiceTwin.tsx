import { motion } from 'framer-motion'
import {
  Headset,
  Sparkles,
  GraduationCap,
  BookOpenCheck,
  Award,
  ArrowLeftRight,
  Bot,
} from 'lucide-react'
import { GlassCard, SectionLabel } from '../components/GlassCard'
import { AnimatedNumber } from '../components/AnimatedNumber'

const twinAbilities = [
  {
    icon: BookOpenCheck,
    title: '學習客服處理方式',
    desc: '從歷史通話與工單持續學習 Eric 的問題拆解邏輯與話術風格',
  },
  {
    icon: GraduationCap,
    title: '協助新人訓練',
    desc: '以 Eric Twin 模擬真實客訴情境，新人上線時間縮短 60%',
  },
  {
    icon: Award,
    title: '延續服務品質',
    desc: '資深客服經驗數位化保存，離職、輪調不再流失 Know-how',
  },
]

export function ServiceTwin() {
  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <div className="chip mx-auto mb-4 border-brand-400/25 bg-brand-400/10 text-brand-300">
          <Sparkles size={13} /> Core Innovation
        </div>
        <h2 className="text-3xl font-extrabold text-white md:text-5xl">
          Every Employee Has An <span className="text-gradient">AI Twin</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-ink-300 md:text-base">
          每一位客服的專業經驗，都能被 AI 學習、複製與延續 — 打造永不流失的服務資產
        </p>
      </motion.div>

      {/* Twin pairing visual */}
      <GlassCard hover={false} className="relative mb-8 overflow-hidden p-8 md:p-12">
        <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:gap-16">
          {/* Human agent */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-ink-500 to-ink-800 text-white shadow-card">
              <Headset size={44} />
            </div>
            <div>
              <div className="text-lg font-bold text-white">客服 Eric</div>
              <div className="text-xs text-ink-300">資深客服專員 · 8 年經驗</div>
            </div>
          </motion.div>

          {/* Sync link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="relative flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-brand-400"
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
            </div>
            <ArrowLeftRight size={18} className="text-brand-400" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-ink-400">
              Knowledge Sync
            </span>
          </motion.div>

          {/* AI Twin avatar with animated aura */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <div className="relative">
              {[0, 1].map((i) => (
                <motion.span
                  key={i}
                  className="absolute inset-0 rounded-full border border-brand-400/40"
                  animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, delay: i * 1.3, ease: 'easeOut' }}
                />
              ))}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 text-white shadow-glow"
              >
                <Bot size={44} />
                <motion.span
                  className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-600 shadow"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <Sparkles size={14} />
                </motion.span>
              </motion.div>
            </div>
            <div>
              <div className="text-lg font-bold text-gradient">Eric Twin</div>
              <div className="text-xs text-ink-300">AI Service Twin · 持續學習中</div>
            </div>
          </motion.div>
        </div>

        {/* Twin stats */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-ink-200">Knowledge Learned</span>
              <span className="text-2xl font-extrabold text-white">
                <AnimatedNumber value={95} suffix="%" />
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-brand-300"
                initial={{ width: 0 }}
                animate={{ width: '95%' }}
                transition={{ duration: 1.4, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="mt-2 text-xs text-ink-300">已學習 12,483 通歷史對話 · 3,206 張工單</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72 }}
            className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-ink-200">Response Style</span>
              <span className="text-2xl font-extrabold text-gradient">Professional</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {['同理心優先', '精準拆解問題', '主動給補償', '結尾確認滿意度'].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-brand-400/20 bg-brand-500/[0.08] px-2.5 py-1 text-[11px] text-brand-200"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-2 text-xs text-ink-300">風格相似度 93% · 由 AI 風格建模引擎持續校準</div>
          </motion.div>
        </div>
      </GlassCard>

      {/* Ability cards */}
      <SectionLabel>AI Twin 能力</SectionLabel>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {twinAbilities.map((a, i) => (
          <GlassCard key={a.title} delay={0.15 + i * 0.1} className="p-6">
            <div className="mb-3 inline-flex rounded-xl bg-brand-500/15 p-3 text-brand-400">
              <a.icon size={22} />
            </div>
            <div className="text-base font-bold text-white">{a.title}</div>
            <div className="mt-1.5 text-sm leading-relaxed text-ink-300">{a.desc}</div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
