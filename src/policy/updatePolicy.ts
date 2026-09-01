import type { Policy } from './types'

export function updatePolicy<K extends keyof Policy>(
  policy: Policy,
  key: K,
  value: Policy[K],
): Policy {
  return {
    ...policy,
    [key]: value,
  }
}
