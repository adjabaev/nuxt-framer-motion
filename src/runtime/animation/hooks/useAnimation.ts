import { animationControls } from '#motion/animation/hooks/animationControls'
import type { AnimationControls } from '#motion/animation/types'
import { useConstant } from '#motion/utils/useConstant'
import { useIsomorphicLayoutEffect } from '#motion/utils/useIsomorphicLayoutEffect'

/**
 * Creates `AnimationControls`, which can be used to manually start, stop
 * and sequence animations on one or more components.
 *
 * The returned `AnimationControls` should be passed to the `animate` property
 * of the components you want to animate.
 *
 * These components can then be animated with the `start` method.
 *
 * ```jsx
 * import * as React from 'react'
 * import { motion, useAnimation } from 'framer-motion'
 *
 * export function MyComponent(props) {
 *    const controls = useAnimation()
 *
 *    controls.start({
 *        x: 100,
 *        transition: { duration: 0.5 },
 *    })
 *
 *    return <motion.div animate={controls} />
 * }
 * ```
 *
 * @returns Animation controller with `start` and `stop` methods
 *
 * @public
 */
export function useAnimationControls(): AnimationControls {
  const controls = useConstant(animationControls)

  useIsomorphicLayoutEffect(controls.mount)

  return controls
}

export const useAnimation = useAnimationControls
