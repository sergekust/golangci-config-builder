import { arangoDbQuestion } from './arangoDb'
import { ignoredErrorsQuestion } from './ignoredErrors'
import type { QuestionDefinition } from './types'
import type { Policy } from '../policy/types'

export type AnyQuestionDefinition = {
  [K in keyof Policy]: QuestionDefinition<K>
}[keyof Policy]

export const QUESTIONS = [
  ignoredErrorsQuestion,
  arangoDbQuestion,
] as const satisfies readonly AnyQuestionDefinition[]

export const QUESTION_TOTAL = QUESTIONS.length

export const QUESTION_TOPICS: ReadonlySet<string> = new Set(
  QUESTIONS.map((question) => question.topic),
)
