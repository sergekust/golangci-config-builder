import { useState, type ReactNode } from 'react'

type ConfigPreviewProps = {
  yaml: string
  yamlRevision: number
  changedLineNumbers: readonly number[]
  status: string
  onReset: () => void
}

function CopyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <rect x="5.25" y="5.25" width="8" height="8" rx="1" />
      <path d="M10.75 5.25V3.5a.75.75 0 0 0-.75-.75H3.5a.75.75 0 0 0-.75.75V10a.75.75 0 0 0 .75.75h1.75" />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M3.15 5.2A5.5 5.5 0 1 1 2.5 8" />
      <path d="M3.2 1.95V5.2h3.25" />
    </svg>
  )
}

function highlightYamlLine(line: string): ReactNode {
  if (line.trim() === '') return '\u00a0'

  const listMatch = line.match(/^(\s*)(-)(\s+)(.+)$/)
  if (listMatch) {
    return (
      <>
        {listMatch[1]}
        <span className="yaml-punctuation">{listMatch[2]}</span>
        {listMatch[3]}
        <span className="yaml-value">{listMatch[4]}</span>
      </>
    )
  }

  const colonIndex = line.indexOf(':')
  if (colonIndex === -1) return line

  const key = line.slice(0, colonIndex)
  const value = line.slice(colonIndex + 1)

  return (
    <>
      <span className="yaml-key">{key}</span>
      <span className="yaml-punctuation">:</span>
      {value ? <span className="yaml-value">{value}</span> : null}
    </>
  )
}

export function ConfigPreview({
  yaml,
  yamlRevision,
  changedLineNumbers,
  status,
  onReset,
}: ConfigPreviewProps) {
  const [copyResult, setCopyResult] = useState<{
    yaml: string
    status: 'copied' | 'failed'
  } | null>(null)
  const lines = yaml.trimEnd().split('\n')

  const copyYaml = async () => {
    try {
      await navigator.clipboard.writeText(yaml)
      setCopyResult({ yaml, status: 'copied' })
    } catch {
      setCopyResult({ yaml, status: 'failed' })
    }
  }

  const copyLabel =
    copyResult?.yaml === yaml && copyResult.status === 'copied'
      ? 'Copied'
      : copyResult?.yaml === yaml && copyResult.status === 'failed'
        ? 'Copy failed'
        : 'Copy'
  const copyAnnouncement =
    copyResult?.yaml === yaml
      ? copyResult.status === 'copied'
        ? 'Configuration copied to the clipboard.'
        : 'The configuration could not be copied.'
      : ''

  return (
    <section className="config-preview" aria-labelledby="config-title">
      <header className="config-preview__header">
        <h2 id="config-title">.golangci.yml</h2>
        <div className="config-actions">
          <button onClick={copyYaml} type="button">
            <CopyIcon />
            <span>{copyLabel}</span>
          </button>
          <button onClick={onReset} type="button">
            <ResetIcon />
            <span>Reset</span>
          </button>
        </div>
      </header>

      <div className="config-preview__body">
        <pre aria-label="Generated golangci-lint configuration" tabIndex={0}>
          <code>
            {lines.map((line, index) => {
              const isPolicyLine = changedLineNumbers.includes(index + 1)

              return (
                <span
                  className={`yaml-line ${isPolicyLine ? 'yaml-line--changed' : ''}`}
                  key={`${yamlRevision}-${index}-${line}`}
                >
                  <span className="yaml-line__number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="yaml-line__source">
                    {highlightYamlLine(line)}
                  </span>
                </span>
              )
            })}
          </code>
        </pre>
      </div>

      <footer className="config-preview__footer">
        <span className="generated-indicator" aria-hidden="true" />
        <span>{status}</span>
      </footer>
      <p className="sr-only" role="status" aria-atomic="true" aria-live="polite">
        {copyAnnouncement}
      </p>
    </section>
  )
}
