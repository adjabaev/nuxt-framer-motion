import type { DOMVisualElementOptions } from '#motion/render/dom/types'
import { VisualElement } from '#motion/render/VisualElement'
import type { MotionProps, MotionStyle } from '#motion/motion/types'
import type { MotionValue } from '#motion/value'
import type { HTMLRenderState } from '#motion/render/html/types'
import { DOMKeyframesResolver } from '#motion/render/dom/DOMKeyframesResolver'

export abstract class DOMVisualElement<
  Instance extends HTMLElement | SVGElement = HTMLElement,
  State extends HTMLRenderState = HTMLRenderState,
  Options extends DOMVisualElementOptions = DOMVisualElementOptions
> extends VisualElement<Instance, State, Options> {
  sortInstanceNodePosition(a: Instance, b: Instance): number {
    /**
     * compareDocumentPosition returns a bitmask, by using the bitwise &
     * we're returning true if 2 in that bitmask is set to true. 2 is set
     * to true if b preceeds a.
     */
    return a.compareDocumentPosition(b) & 2 ? 1 : -1
  }

  getBaseTargetFromProps(
    props: MotionProps,
    key: string
  ): string | number | MotionValue<any> | undefined {
    return props.style
      ? (props.style[key as keyof MotionStyle] as string)
      : undefined
  }

  removeValueFromRenderState(
    key: string,
    { vars, style }: HTMLRenderState
  ): void {
    delete vars[key]
    delete style[key]
  }

  KeyframeResolver = DOMKeyframesResolver
}
