import { useState } from 'react'
import { ConfigPreview } from './components/ConfigPreview'
import { DecisionPane } from './components/DecisionPane'
import { deriveGolangciConfig } from './config/deriveConfig'
import { findChangedLineNumbers } from './config/findChangedLines'
import { renderYaml } from './config/renderYaml'
import { DEFAULT_POLICY } from './policy/defaults'
import type { IgnoredErrorsPolicy, Policy } from './policy/types'
import { updatePolicy } from './policy/updatePolicy'
import { ignoredErrorsQuestion } from './questions/ignoredErrors'
import './App.css'

function App() {
  const [policy, setPolicy] = useState<Policy>(DEFAULT_POLICY)
  const [yamlRevision, setYamlRevision] = useState(0)
  const [changedYamlLines, setChangedYamlLines] = useState<readonly number[]>([])
  const [announcement, setAnnouncement] = useState('')
  const [isConfirmed, setIsConfirmed] = useState(false)
  const config = deriveGolangciConfig(policy)
  const yaml = renderYaml(config)
  const configStatus =
    policy.ignoredErrors === 'strict'
      ? 'Strict policy · errcheck enabled'
      : policy.ignoredErrors === 'off'
        ? 'Ignored errors off · errcheck not enabled'
        : 'Practical policy · errcheck enabled'

  const trackYamlChange = (nextYaml: string) => {
    const changedLines = findChangedLineNumbers(yaml, nextYaml)
    setChangedYamlLines(changedLines)

    if (changedLines.length > 0) {
      setYamlRevision((revision) => revision + 1)
    }
  }

  const selectIgnoredErrors = (value: IgnoredErrorsPolicy) => {
    const nextPolicy = updatePolicy(
      policy,
      ignoredErrorsQuestion.policyKey,
      value,
    )
    const nextYaml = renderYaml(deriveGolangciConfig(nextPolicy))

    trackYamlChange(nextYaml)
    setPolicy(nextPolicy)
    setIsConfirmed(false)

    const result =
      value === 'off' ? 'errcheck is not enabled.' : 'errcheck enabled.'
    const selectedLabel = ignoredErrorsQuestion.options.find(
      (option) => option.value === value,
    )?.label ?? value
    setAnnouncement(`Ignored-error policy set to ${selectedLabel}. ${result}`)
  }

  const resetPolicy = () => {
    const defaultYaml = renderYaml(deriveGolangciConfig(DEFAULT_POLICY))

    trackYamlChange(defaultYaml)
    setPolicy(DEFAULT_POLICY)
    setIsConfirmed(false)
    setAnnouncement('Policy reset to the recommended practical choice.')
  }

  const confirmDecision = () => {
    const selectedLabel = ignoredErrorsQuestion.options.find(
      (option) => option.value === policy.ignoredErrors,
    )?.label ?? policy.ignoredErrors
    setIsConfirmed(true)
    setAnnouncement(`${selectedLabel} ignored-error policy confirmed.`)
  }

  return (
    <main className="app-shell">
      <DecisionPane
        onChange={selectIgnoredErrors}
        onContinue={confirmDecision}
        question={ignoredErrorsQuestion}
        value={policy.ignoredErrors}
        isConfirmed={isConfirmed}
      />
      <ConfigPreview
        changedLineNumbers={changedYamlLines}
        onReset={resetPolicy}
        status={configStatus}
        yaml={yaml}
        yamlRevision={yamlRevision}
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
