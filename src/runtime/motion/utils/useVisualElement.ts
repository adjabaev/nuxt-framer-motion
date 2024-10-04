import { optimizedAppearDataAttribute } from '#motion/animation/optimizedAppear/dataId'
import { useEffect } from '#motion/composables/useEffect'
import { useInsertionEffect } from '#motion/composables/useInsertionEffect'
import { IKLazyContext, type LazyContextProps } from '#motion/context/LazyContext'
import {
  IKMotionConfigContext,
  type MotionConfigContext,
  motionConfigContextDefault
} from '#motion/context/MotionConfigContext'
import { IKMotionContext } from '#motion/context/MotionContext'
import { IKPresenceContext, type PresenceContextProps } from '#motion/context/PresenceContext'
import {
  IKSwitchLayoutGroupContext,
  type InitialPromotionConfig,
  type SwitchLayoutGroupContext
} from '#motion/context/SwitchLayoutGroupContext'
import { microtask } from '#motion/frameloop/microtask'
import type { MotionProps } from '#motion/motion/types'
import { useMotionRef } from '#motion/motion/utils/useMotionRef'
import type { VisualState } from '#motion/motion/utils/useVisualState'
import type { IProjectionNode } from '#motion/projection/node/types'
import type { CreateVisualElement } from '#motion/render/types'
import type { VisualElement } from '#motion/render/VisualElement'
import { isRefObject } from '#motion/utils/isRefObject'
import { useIsomorphicLayoutEffect } from '#motion/utils/useIsomorphicLayoutEffect'
import type { DefineComponent, Ref } from 'vue'

let scheduleHandoffComplete = false

export function useVisualElement<Instance, RenderState>(
  component: string | DefineComponent,
  element: Ref<Instance>,
  visualState: VisualState<Instance, RenderState>,
  props: MotionProps & Partial<MotionConfigContext>,
  createVisualElement?: CreateVisualElement<Instance>,
  ProjectionNodeConstructor?: any
): VisualElement<Instance> | undefined {
  const { visualElement: parent } = inject(IKMotionContext, {})
  const lazyContext = inject<LazyContextProps>(IKLazyContext, {})
  const presenceContext = inject<PresenceContextProps>(IKPresenceContext, null)
  const reducedMotionConfig = inject<MotionConfigContext>(IKMotionConfigContext, motionConfigContextDefault).reducedMotion

  const visualElementRef = ref<VisualElement<Instance>>()

  /**
   * If we haven't preloaded a renderer, check to see if we have one lazy-loaded
   */
  createVisualElement = createVisualElement || lazyContext.renderer

  if (!visualElementRef.value && createVisualElement) {
    visualElementRef.value = createVisualElement(component, {
      visualState,
      parent,
      props,
      presenceContext,
      blockInitialAnimation: presenceContext
        ? presenceContext.initial === false
        : false,
      reducedMotionConfig
    })
  }

  const visualElement = visualElementRef.value

  /**
   * Load Motion gesture and animation features. These are rendered as renderless
   * components so each feature can optionally make use of React lifecycle methods.
   */
  const initialLayoutGroupConfig = inject<SwitchLayoutGroupContext>(IKSwitchLayoutGroupContext, {})

  if (
    visualElement
    && !visualElement.projection
    && ProjectionNodeConstructor
    && (visualElement.type === 'html' || visualElement.type === 'svg')
  ) {
    createProjectionNode(
      visualElementRef.value!,
      props,
      ProjectionNodeConstructor,
      initialLayoutGroupConfig
    )
  }

  useInsertionEffect(() => {
    visualElement && visualElement.update(props, presenceContext)
  })

  /**
   * Cache this value as we want to know whether HandoffAppearAnimations
   * was present on initial render - it will be deleted after this.
   */
  const optimisedAppearId = props[optimizedAppearDataAttribute as keyof typeof props]
  const wantsHandoff = ref(
    Boolean(optimisedAppearId)
    && !window.MotionHandoffIsComplete
    && window.MotionHasOptimisedAnimation?.(optimisedAppearId)
  )

  const motionRef = useMotionRef<Instance, RenderState>(
    visualState,
    visualElement
  )

  onMounted(() => {
    motionRef.value(element.value)
  })

  useIsomorphicLayoutEffect(() => {
    if (!visualElement) return

    visualElement.updateFeatures()

    microtask.render(visualElement.render)

    /**
     * Ideally this function would always run in a useEffect.
     *
     * However, if we have optimised appear animations to handoff from,
     * it needs to happen synchronously to ensure there's no flash of
     * incorrect styles in the event of a hydration error.
     *
     * So if we detect a situtation where optimised appear animations
     * are running, we use useLayoutEffect to trigger animations.
     */
    if (wantsHandoff.value && visualElement.animationState) {
      visualElement.animationState.animateChanges()
    }
  })

  useEffect(() => {
    if (!visualElement) return

    if (!wantsHandoff.value && visualElement.animationState) {
      visualElement.animationState.animateChanges()
    }

    wantsHandoff.value = false
    // This ensures all future calls to animateChanges() will run in useEffect
    if (!scheduleHandoffComplete) {
      scheduleHandoffComplete = true
      queueMicrotask(completeHandoff)
    }
  })

  return visualElement
}

function completeHandoff() {
  window.MotionHandoffIsComplete = true
}

function createProjectionNode(
  visualElement: VisualElement<any>,
  props: MotionProps,
  ProjectionNodeConstructor: any,
  initialPromotionConfig?: InitialPromotionConfig
) {
  const {
    layoutId,
    layout,
    drag,
    dragConstraints,
    layoutScroll,
    layoutRoot
  } = props

  visualElement.projection = new ProjectionNodeConstructor(
    visualElement.latestValues,
    props['data-framer-portal-id']
      ? undefined
      : getClosestProjectingNode(visualElement.parent)
  ) as IProjectionNode

  visualElement.projection.setOptions({
    layoutId,
    layout,
    alwaysMeasureLayout:
      Boolean(drag) || (dragConstraints && isRefObject(dragConstraints)),
    visualElement,
    /**
     * TODO: Update options in an effect. This could be tricky as it'll be too late
     * to update by the time layout animations run.
     * We also need to fix this safeToRemove by linking it up to the one returned by usePresence,
     * ensuring it gets called if there's no potential layout animations.
     *
     */
    animationType: typeof layout === 'string' ? layout : 'both',
    initialPromotionConfig,
    layoutScroll,
    layoutRoot
  })
}

function getClosestProjectingNode(
  visualElement?: VisualElement<
    unknown,
    unknown,
    { allowProjection?: boolean }
  >
): IProjectionNode | undefined {
  if (!visualElement) return undefined

  return visualElement.options.allowProjection !== false
    ? visualElement.projection
    : getClosestProjectingNode(visualElement.parent)
}