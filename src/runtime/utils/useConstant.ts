type Init<T> = () => T

/**
 * Creates a constant value over the lifecycle of a component.
 *
 * Even if `useMemo` is provided an empty array as its final argument, it doesn't offer
 * a guarantee that it won't re-run for performance reasons later on. By using `useConstant`
 * you can ensure that initialisers don't execute twice or more.
 */
export function useConstant<T>(init: Init<T>) {
  const r = ref<T | null>(null)

  if (r.value === null) {
    r.value = init()
  }

  return r.value
}
