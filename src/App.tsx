import { useState } from 'react'
import { ConfigPreview } from './components/ConfigPreview'
import { DecisionPane } from './components/DecisionPane'
import { SuccessPane } from './components/SuccessPane'
import { deriveGolangciConfig } from './config/deriveConfig'
import {
  createPreviewYamlLines,
  findChangedLines,
  hasYamlChanges,
  type PreviewYamlLine,
} from './config/findChangedLines'
import { renderYamlDocument } from './config/renderYaml'
import { GOLANGCI_LINT_VERSION } from './config/targetVersion'
import { validateYaml } from './config/validateYaml'
import { EMPTY_POLICY } from './policy/defaults'
import type { Policy, PolicyValue } from './policy/types'
import { updatePolicy } from './policy/updatePolicy'
import { QUESTIONS, QUESTION_TOTAL } from './questions/catalog'
import type { QuestionDefinition } from './questions/types'
import './App.css'

const EMPTY_DOCUMENT = renderYamlDocument(deriveGolangciConfig(EMPTY_POLICY))

function countAnsweredQuestions(policy: Policy): number {
  return QUESTIONS.filter(
    (question) => policy[question.policyKey] !== undefined,
  ).length
}

function decisionLabel(count: number): string {
  return count === 1 ? 'decision' : 'decisions'
}

function App() {
  const [policy, setPolicy] = useState<Policy>(EMPTY_POLICY)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [previewLines, setPreviewLines] = useState<
    readonly PreviewYamlLine[]
  >(() => createPreviewYamlLines(EMPTY_DOCUMENT.lines))
  const [changeRevision, setChangeRevision] = useState(0)
  const [announcement, setAnnouncement] = useState('')

  const currentQuestion = QUESTIONS[questionIndex]
  const config = deriveGolangciConfig(policy)
  const document = renderYamlDocument(config)
  const validation = validateYaml(document.text)
  const answeredCount = countAnsweredQuestions(policy)
  const enabledCount = config.linters.enable?.length ?? 0
  const enabledLabel = enabledCount === 1 ? 'linter' : 'linters'
  const configStatus = `${enabledCount} ${enabledLabel} enabled · ${answeredCount} of ${QUESTION_TOTAL} ${decisionLabel(QUESTION_TOTAL)}`

  const showDocumentChanges = (
    previousPolicy: Policy,
    nextPolicy: Policy,
  ) => {
    const previousDocument = renderYamlDocument(
      deriveGolangciConfig(previousPolicy),
    )
    const nextDocument = renderYamlDocument(deriveGolangciConfig(nextPolicy))
    const nextPreviewLines = findChangedLines(
      previousDocument.lines,
      nextDocument.lines,
    )

    setPreviewLines(nextPreviewLines)
    if (hasYamlChanges(nextPreviewLines)) {
      setChangeRevision((revision) => revision + 1)
    }
  }

  const clearDocumentChanges = (nextPolicy: Policy = policy) => {
    const nextDocument = renderYamlDocument(deriveGolangciConfig(nextPolicy))
    setPreviewLines(createPreviewYamlLines(nextDocument.lines))
  }

  const selectAnswer = <K extends keyof Policy>(
    question: QuestionDefinition<K>,
    value: PolicyValue<K>,
  ) => {
    const nextPolicy = updatePolicy(policy, question.policyKey, value)
    const selectedLabel = question.options.find(
      (option) => option.value === value,
    )?.label

    showDocumentChanges(policy, nextPolicy)
    setPolicy(nextPolicy)
    setAnnouncement(
      selectedLabel
        ? `${question.title}: ${selectedLabel}.`
        : `${question.title}: answer selected.`,
    )
  }

  const continueFlow = () => {
    clearDocumentChanges()

    if (questionIndex === QUESTION_TOTAL - 1) {
      setIsComplete(true)
      setAnnouncement('Configuration complete.')
      return
    }

    setQuestionIndex((index) => index + 1)
  }

  const goBack = () => {
    clearDocumentChanges()
    setQuestionIndex((index) => Math.max(0, index - 1))
  }

  const returnFromSuccess = () => {
    clearDocumentChanges()
    setIsComplete(false)
    setQuestionIndex(Math.max(0, QUESTION_TOTAL - 1))
    setAnnouncement('Returned to the last question.')
  }

  const resetPolicy = () => {
    setPolicy(EMPTY_POLICY)
    setQuestionIndex(0)
    setIsComplete(false)
    setPreviewLines(createPreviewYamlLines(EMPTY_DOCUMENT.lines))
    setChangeRevision((revision) => revision + 1)
    setAnnouncement('All decisions cleared.')
  }

  return (
    <main className="app-shell">
      {isComplete ? (
        <SuccessPane
          decisionCount={answeredCount}
          onBack={returnFromSuccess}
          targetVersion={GOLANGCI_LINT_VERSION}
        />
      ) : (
        <DecisionPane
          canGoBack={questionIndex > 0}
          key={currentQuestion.id}
          onBack={goBack}
          onChange={(value) => selectAnswer(currentQuestion, value)}
          onContinue={continueFlow}
          question={currentQuestion}
          total={QUESTION_TOTAL}
          value={policy[currentQuestion.policyKey]}
        />
      )}
      <ConfigPreview
        changeRevision={changeRevision}
        isValid={validation.valid}
        lines={previewLines}
        onReset={resetPolicy}
        status={configStatus}
        targetVersion={GOLANGCI_LINT_VERSION}
        validationErrors={validation.errors}
        yaml={document.text}
      />
      <p
        className="sr-only"
        role="status"
        aria-atomic="true"
        aria-live="polite"
      >
        {announcement}
      </p>
    </main>
  )
}

export default App
