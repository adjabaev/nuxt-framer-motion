import type { KeyframeGenerator } from '#motion/animation/generators/types'

/**
 * Implement a practical max duration for keyframe generation
 * to prevent infinite loops
 */
export const maxGeneratorDuration = 20_000
export function calcGeneratorDuration(generator: KeyframeGenerator<unknown>) {
  let duration = 0
  const timeStep = 50
  let state = generator.next(duration)
  while (!state.done && duration < maxGeneratorDuration) {
    duration += timeStep
    state = generator.next(duration)
  }

  return duration >= maxGeneratorDuration ? Infinity : duration
}
