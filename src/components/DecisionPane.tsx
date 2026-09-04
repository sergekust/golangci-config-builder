import { useState } from 'react'
import type { Policy, PolicyValue } from '../policy/types'
import type { QuestionDefinition } from '../questions/types'
import { ChoiceGroup } from './ChoiceGroup'
import { CodeSample } from './CodeSample'

type DecisionPaneProps<K extends keyof Policy> = {
  question: QuestionDefinition<K>
  value: Policy[K]
  total: number
  onChange: (value: PolicyValue<K>) => void
  onBack: () => void
  onContinue: () => void
  canGoBack: boolean
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M3.5 10h12M11.5 5.75 15.75 10l-4.25 4.25" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M16.5 10h-12M8.5 5.75 4.25 10l4.25 4.25" />
    </svg>
  )
}

export function DecisionPane<K extends keyof Policy>({
  question,
  value,
  total,
  onChange,
  onBack,
  onContinue,
  canGoBack,
}: DecisionPaneProps<K>) {
  const [previewedOptionId, setPreviewedOptionId] = useState<string | null>(
    null,
  )
  const selectedOption = question.options.find(
    (option) => option.value === value,
  )
  const previewedOption =
    previewedOptionId === null
      ? undefined
      : question.options.find((option) => option.id === previewedOptionId)
  const activeCode =
    previewedOptionId === null ? selectedOption?.code : previewedOption?.code
  const progress = `${(question.position / total) * 100}%`

  return (
    <section className="decision-pane" aria-labelledby={`${question.id}-title`}>
      <div className="question-panel">
        <div className="question-panel__inner">
          <div
            className="question-context"
            aria-label={`${question.topic}, question ${question.position} of ${total}`}
          >
            <div className="question-context__text">
              <span>{question.topic}</span>
              <span aria-hidden="true">·</span>
              <span>
                {question.position} of {total}
              </span>
            </div>
            <span className="progress-track" aria-hidden="true">
              <span style={{ inlineSize: progress }} />
            </span>
          </div>

          <h1 id={`${question.id}-title`}>{question.title}</h1>

          {activeCode ? <CodeSample source={activeCode} /> : null}

          <p
            className="question-explanation"
            id={`${question.id}-explanation`}
          >
            {question.comment}
          </p>
        </div>
      </div>

      <div className="answer-panel">
        <div className="answer-panel__inner">
          <ChoiceGroup
            question={question}
            value={value}
            onChange={onChange}
            onPreview={setPreviewedOptionId}
            onPreviewEnd={() => setPreviewedOptionId(null)}
          />

          <div className="answer-actions">
            {canGoBack ? (
              <button className="back-button" onClick={onBack} type="button">
                <BackIcon />
                <span>Back</span>
              </button>
            ) : (
              <p>Choose the tradeoff that fits your team.</p>
            )}
            <button
              className="continue-button"
              disabled={value === undefined}
              onClick={onContinue}
              type="button"
            >
              <span>Continue</span>
              <ArrowIcon />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
