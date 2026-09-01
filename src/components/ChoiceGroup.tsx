import type { Policy } from '../policy/types'
import type { QuestionDefinition } from '../questions/types'
import type { KeyboardEvent } from 'react'

type ChoiceGroupProps<K extends keyof Policy> = {
  question: QuestionDefinition<K>
  value: Policy[K]
  onChange: (value: Policy[K]) => void
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="m3.25 8.3 2.85 2.85 6.65-6.65" />
    </svg>
  )
}

export function ChoiceGroup<K extends keyof Policy>({
  question,
  value,
  onChange,
}: ChoiceGroupProps<K>) {
  const handleArrowNavigation = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    const direction =
      event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
          ? -1
          : 0

    if (direction === 0) return

    event.preventDefault()
    const nextIndex =
      (index + direction + question.options.length) % question.options.length
    const inputs = event.currentTarget
      .closest('fieldset')
      ?.querySelectorAll<HTMLInputElement>('input[type="radio"]')

    inputs?.[nextIndex]?.focus()
    onChange(question.options[nextIndex].value)
  }

  return (
    <fieldset
      className="choice-group"
      aria-describedby={`${question.id}-explanation`}
    >
      <legend className="sr-only">{question.prompt}</legend>
      {question.options.map((option, index) => {
        const isSelected = option.value === value
        const inputId = `${question.id}-${String(option.value)}`

        return (
          <label
            className={`choice ${isSelected ? 'choice--selected' : ''}`}
            htmlFor={inputId}
            key={String(option.value)}
          >
            <input
              checked={isSelected}
              id={inputId}
              name={question.id}
              onChange={() => onChange(option.value)}
              onKeyDown={(event) => handleArrowNavigation(event, index)}
              type="radio"
              value={String(option.value)}
            />
            <span className="choice__surface">
              <span className="choice__marker" aria-hidden="true">
                {isSelected ? <CheckIcon /> : null}
              </span>
              <span className="choice__copy">
                <span className="choice__title-row">
                  <span className="choice__title">{option.label}</span>
                  {option.recommended ? (
                    <span className="choice__recommendation">Recommended</span>
                  ) : null}
                </span>
                <span className="choice__description">{option.description}</span>
              </span>
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}
