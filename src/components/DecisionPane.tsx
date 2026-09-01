import type { Policy } from '../policy/types'
import type { QuestionDefinition } from '../questions/types'
import { ChoiceGroup } from './ChoiceGroup'
import { CodeSample } from './CodeSample'

type DecisionPaneProps<K extends keyof Policy> = {
  question: QuestionDefinition<K>
  value: Policy[K]
  onChange: (value: Policy[K]) => void
  onContinue: () => void
  isConfirmed: boolean
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M3.5 10h12M11.5 5.75 15.75 10l-4.25 4.25" />
    </svg>
  )
}

function ConfirmIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="m4.5 10.25 3.35 3.35 7.65-7.65" />
    </svg>
  )
}

export function DecisionPane<K extends keyof Policy>({
  question,
  value,
  onChange,
  onContinue,
  isConfirmed,
}: DecisionPaneProps<K>) {
  const progress = `${(question.position / question.total) * 100}%`

  return (
    <section className="decision-pane" aria-labelledby={`${question.id}-title`}>
      <div className="question-panel">
        <div className="question-panel__inner">
          <div
            className="question-context"
            aria-label={`${question.group}, question ${question.position} of ${question.total}`}
          >
            <div className="question-context__text">
              <span>{question.group}</span>
              <span aria-hidden="true">·</span>
              <span>
                {question.position} of {question.total}
              </span>
            </div>
            <span className="progress-track" aria-hidden="true">
              <span style={{ inlineSize: progress }} />
            </span>
          </div>

          <h1 id={`${question.id}-title`}>{question.prompt}</h1>

          <CodeSample {...question.code} />

          <p
            className="question-explanation"
            id={`${question.id}-explanation`}
          >
            {question.explanation}
          </p>
        </div>
      </div>

      <div className="answer-panel">
        <div className="answer-panel__inner">
          <ChoiceGroup question={question} value={value} onChange={onChange} />

          <div className="answer-actions">
            <p>Choose the tradeoff that fits your team.</p>
            <button
              className={`continue-button ${isConfirmed ? 'continue-button--confirmed' : ''}`}
              onClick={onContinue}
              type="button"
            >
              <span>{isConfirmed ? 'Decision set' : 'Continue'}</span>
              {isConfirmed ? <ConfirmIcon /> : <ArrowIcon />}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
