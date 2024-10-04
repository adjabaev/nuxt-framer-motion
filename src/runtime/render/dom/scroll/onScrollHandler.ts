import { warnOnce } from '#motion/utils/warnOnce'
import { updateScrollInfo } from '#motion/render/dom/scroll/info'
import { resolveOffsets } from '#motion/render/dom/scroll/offsets'
import type {
  OnScrollHandler,
  OnScrollInfo,
  ScrollInfo,
  ScrollInfoOptions
} from '#motion/render/dom/scroll/types'

function measure(
  container: HTMLElement,
  target: Element = container,
  info: ScrollInfo
) {
  /**
   * Find inset of target within scrollable container
   */
  info.x.targetOffset = 0
  info.y.targetOffset = 0
  if (target !== container) {
    let node = target as HTMLElement
    while (node && node !== container) {
      info.x.targetOffset += node.offsetLeft
      info.y.targetOffset += node.offsetTop
      node = node.offsetParent as HTMLElement
    }
  }

  info.x.targetLength
    = target === container ? target.scrollWidth : target.clientWidth
  info.y.targetLength
    = target === container ? target.scrollHeight : target.clientHeight
  info.x.containerLength = container.clientWidth
  info.y.containerLength = container.clientHeight

  /**
   * In development mode ensure scroll containers aren't position: static as this makes
   * it difficult to measure their relative positions.
   */
  if (process.env.NODE_ENV !== 'production') {
    if (container && target && target !== container) {
      warnOnce(
        getComputedStyle(container).position !== 'static',
        'Please ensure that the container has a non-static position, like \'relative\', \'fixed\', or \'absolute\' to ensure scroll offset is calculated correctly.'
      )
    }
  }
}

export function createOnScrollHandler(
  element: HTMLElement,
  onScroll: OnScrollInfo,
  info: ScrollInfo,
  options: ScrollInfoOptions = {}
): OnScrollHandler {
  return {
    measure: () => measure(element, options.target, info),
    update: (time) => {
      updateScrollInfo(element, info, time)

      if (options.offset || options.target) {
        resolveOffsets(element, info, options)
      }
    },
    notify: () => onScroll(info)
  }
}