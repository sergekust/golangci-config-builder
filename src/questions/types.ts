import type { Policy } from '../policy/types'

export type QuestionOption<K extends keyof Policy> = {
  value: Policy[K]
  label: string
  description: string
  recommended?: boolean
}

export type QuestionDefinition<K extends keyof Policy> = {
  id: string
  group: string
  position: number
  total: number
  policyKey: K
  prompt: string
  explanation: string
  code: {
    language: 'go'
    filename: string
    source: string
  }
  options: readonly QuestionOption<K>[]
}
