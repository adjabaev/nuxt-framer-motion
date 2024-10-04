import { isSVGElement } from '#motion/render/dom/utils/isSVGElement'
import { SVGVisualElement } from '#motion/render/svg/SVGVisualElement'
import { HTMLVisualElement } from '#motion/render/html/HTMLVisualElement'
import { visualElementStore } from '#motion/render/store'

export function createVisualElement(element: HTMLElement | SVGElement) {
  const options = {
    presenceContext: null,
    props: {},
    visualState: {
      renderState: {
        transform: {},
        transformOrigin: {},
        style: {},
        vars: {},
        attrs: {}
      },
      latestValues: {}
    }
  }
  const node = isSVGElement(element)
    ? new SVGVisualElement(options)
    : new HTMLVisualElement(options)

  node.mount(element as any)

  visualElementStore.set(element, node)
}