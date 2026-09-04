import type { Policy, PolicyValue } from '../policy/types'

export type QuestionOption<K extends keyof Policy> = {
  id: string
  value: PolicyValue<K>
  label: string
  description: string
  code?: string
  recommended?: boolean
}

export type QuestionDefinition<K extends keyof Policy> = {
  id: string
  topic: string
  position: number
  policyKey: K
  title: string
  comment: string
  options: readonly QuestionOption<K>[]
}
