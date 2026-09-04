import type { Policy, PolicyValue } from './types'

export function updatePolicy<K extends keyof Policy>(
  policy: Policy,
  key: K,
  value: PolicyValue<K>,
): Policy {
  return {
    ...policy,
    [key]: value,
  }
}
