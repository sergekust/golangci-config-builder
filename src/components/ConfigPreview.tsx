import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { PreviewYamlLine } from '../config/findChangedLines'

type ConfigPreviewProps = {
  yaml: string
  lines: readonly PreviewYamlLine[]
  changeRevision: number
  targetVersion: string
  validationErrors: readonly string[]
  isValid: boolean
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
  lines,
  changeRevision,
  targetVersion,
  validationErrors,
  isValid,
  status,
  onReset,
}: ConfigPreviewProps) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [copyResult, setCopyResult] = useState<{
    yaml: string
    status: 'copied' | 'failed'
  } | null>(null)

  useEffect(() => {
    const firstChange =
      bodyRef.current?.querySelector<HTMLElement>('[data-yaml-change]')

    if (!firstChange) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    firstChange.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }, [changeRevision])

  const copyYaml = async () => {
    if (!isValid) return

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
          <button disabled={!isValid} onClick={copyYaml} type="button">
            <CopyIcon />
            <span>{copyLabel}</span>
          </button>
          <button onClick={onReset} type="button">
            <ResetIcon />
            <span>Reset</span>
          </button>
        </div>
      </header>

      <div className="config-preview__body" ref={bodyRef}>
        <pre aria-label="Generated golangci-lint configuration" tabIndex={0}>
          <code>
            {lines.map((line) => {
              return (
                <span
                  className={`yaml-line ${line.change ? `yaml-line--${line.change}` : ''}`}
                  data-yaml-change={line.change || undefined}
                  key={`${changeRevision}-${line.id}-${line.change ?? 'stable'}`}
                >
                  <span className="yaml-line__number" aria-hidden="true">
                    {line.lineNumber}
                  </span>
                  <span className="yaml-line__source">
                    {highlightYamlLine(line.text)}
                  </span>
                </span>
              )
            })}
          </code>
        </pre>
      </div>

      <footer className="config-preview__footer">
        <span
          className={`generated-indicator ${isValid ? '' : 'generated-indicator--invalid'}`}
          aria-hidden="true"
        />
        <span title={validationErrors.join('\n') || undefined}>
          {isValid ? 'Valid' : 'Invalid'} for golangci-lint {targetVersion} ·{' '}
          {status}
        </span>
      </footer>
      <p className="sr-only" role="status" aria-atomic="true" aria-live="polite">
        {copyAnnouncement}
      </p>
    </section>
  )
}
