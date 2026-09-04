import type { Policy } from '../policy/types'
import type { GolangciConfigV2 } from './types'

type LinterContributor = (policy: Policy) => readonly string[]

const ignoredErrorsLinters: LinterContributor = (policy) =>
  policy.ignoredErrors === 'report' ? ['errcheck'] : []

const arangoDbLinters: LinterContributor = (policy) =>
  policy.arangoDbUsage === 'use' ? ['arangolint'] : []

const linterContributors: readonly LinterContributor[] = [
  ignoredErrorsLinters,
  arangoDbLinters,
]

function compareStrings(left: string, right: string): number {
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

export function deriveGolangciConfig(policy: Policy): GolangciConfigV2 {
  const enabledLinters = new Set<string>()

  for (const contribute of linterContributors) {
    for (const linter of contribute(policy)) {
      enabledLinters.add(linter)
    }
  }

  const enable = [...enabledLinters].sort(compareStrings)

  return {
    version: '2',
    linters: {
      default: 'none',
      ...(enable.length > 0 ? { enable } : {}),
    },
  }
}
