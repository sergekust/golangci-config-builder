import type { Policy, PolicyValue } from '../policy/types'
import type { QuestionDefinition } from '../questions/types'
import type { FocusEvent, KeyboardEvent } from 'react'

type ChoiceGroupProps<K extends keyof Policy> = {
  question: QuestionDefinition<K>
  value: Policy[K]
  onChange: (value: PolicyValue<K>) => void
  onPreview: (optionId: string) => void
  onPreviewEnd: () => void
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
  onPreview,
  onPreviewEnd,
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

  const handlePreviewBlur = (event: FocusEvent<HTMLFieldSetElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      onPreviewEnd()
    }
  }

  return (
    <fieldset
      className="choice-group"
      aria-describedby={`${question.id}-explanation`}
      onBlur={handlePreviewBlur}
      onMouseLeave={onPreviewEnd}
    >
      <legend className="sr-only">{question.title}</legend>
      {question.options.map((option, index) => {
        const isSelected = option.value === value
        const inputId = `${question.id}-${option.id}`

        return (
          <label
            className={`choice ${isSelected ? 'choice--selected' : ''}`}
            htmlFor={inputId}
            key={option.id}
            onMouseEnter={() => onPreview(option.id)}
          >
            <input
              checked={isSelected}
              id={inputId}
              name={question.id}
              onChange={() => onChange(option.value)}
              onFocus={() => onPreview(option.id)}
              onKeyDown={(event) => handleArrowNavigation(event, index)}
              type="radio"
              value={option.id}
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
