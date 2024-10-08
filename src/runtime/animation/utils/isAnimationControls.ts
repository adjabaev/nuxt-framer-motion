import type { AnimationControls } from '#motion/animation/types'

export function isAnimationControls(v?: unknown): v is AnimationControls {
  return (
    v !== null
    && typeof v === 'object'
    && typeof (v as AnimationControls).start === 'function'
  )
}
