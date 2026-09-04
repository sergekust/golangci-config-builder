export type IgnoredErrorsPolicy = 'report' | 'allow'
export type ArangoDbUsagePolicy = 'use' | 'do-not-use'

export type Policy = {
  ignoredErrors?: IgnoredErrorsPolicy
  arangoDbUsage?: ArangoDbUsagePolicy
}

export type PolicyValue<K extends keyof Policy> = Exclude<
  Policy[K],
  undefined
>
