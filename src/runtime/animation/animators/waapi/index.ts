import { mapEasingToNativeEasing } from '#motion/animation/animators/waapi/easing'
import type { NativeAnimationOptions } from '#motion/animation/animators/waapi/types'

export function startWaapiAnimation(
  element: Element,
  valueName: string,
  keyframes: string[] | number[],
  {
    delay = 0,
    duration = 300,
    repeat = 0,
    repeatType = 'loop',
    ease,
    times
  }: NativeAnimationOptions = {}
) {
  const keyframeOptions: PropertyIndexedKeyframes = { [valueName]: keyframes }
  if (times) keyframeOptions.offset = times

  const easing = mapEasingToNativeEasing(ease, duration)

  /**
   * If this is an easing array, apply to keyframes, not animation as a whole
   */
  if (Array.isArray(easing)) keyframeOptions.easing = easing

  return element.animate(keyframeOptions, {
    delay,
    duration,
    easing: !Array.isArray(easing) ? easing : 'linear',
    fill: 'both',
    iterations: repeat + 1,
    direction: repeatType === 'reverse' ? 'alternate' : 'normal'
  })
}