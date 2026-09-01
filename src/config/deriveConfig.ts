import type { Policy } from '../policy/types'
import type { GolangciConfigV2, GolangciLinterRule } from './types'

type RuleContributor = (policy: Policy) => readonly GolangciLinterRule[]

const ignoredErrorsRules: RuleContributor = (policy) => {
  if (policy.ignoredErrors === 'off') {
    return []
  }

  return [{ name: 'errcheck' }]
}

const ruleContributors: readonly RuleContributor[] = [ignoredErrorsRules]

export function deriveGolangciConfig(policy: Policy): GolangciConfigV2 {
  const enabledLinters = new Set<string>()

  for (const contribute of ruleContributors) {
    for (const rule of contribute(policy)) {
      enabledLinters.add(rule.name)
    }
  }

  return {
    version: '2',
    linters: {
      default: 'none',
      enable: [...enabledLinters].sort(),
    },
  }
}
