import type { MotionValue, type MotionValueEventCallbacks } from '#motion/value'

export function useMotionValueEvent<
  V,
  EventName extends keyof MotionValueEventCallbacks<V>
>(
  value: MotionValue<V>,
  event: EventName,
  callback: MotionValueEventCallbacks<V>[EventName]
) {
  /**
   * useInsertionEffect will create subscriptions before any other
   * effects will run. Effects run upwards through the tree so it
   * can be that binding a useLayoutEffect higher up the tree can
   * miss changes from lower down the tree.
   */
  onBeforeMount(
    () => value.on(event, callback)
  )
}
