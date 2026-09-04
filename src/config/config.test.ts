import { describe, expect, it } from 'vitest'
import { deriveGolangciConfig } from './deriveConfig'
import {
  createPreviewYamlLines,
  findChangedLines,
  hasYamlChanges,
} from './findChangedLines'
import { renderYamlDocument, type RenderedYamlLine } from './renderYaml'
import { validateYaml } from './validateYaml'
import { EMPTY_POLICY } from '../policy/defaults'

describe('canonical golangci-lint config', () => {
  it('renders the exact empty v2 baseline', () => {
    const document = renderYamlDocument(deriveGolangciConfig(EMPTY_POLICY))

    expect(document.text).toBe(
      'version: "2"\n\nlinters:\n  default: none\n',
    )
    expect(validateYaml(document.text)).toEqual({ valid: true, errors: [] })
  })

  it('enables errcheck only for the report policy', () => {
    const report = renderYamlDocument(
      deriveGolangciConfig({ ignoredErrors: 'report' }),
    )
    const allow = renderYamlDocument(
      deriveGolangciConfig({ ignoredErrors: 'allow' }),
    )

    expect(report.text).toBe(
      'version: "2"\n\nlinters:\n  default: none\n  enable:\n    - errcheck\n',
    )
    expect(allow.text).toBe(
      'version: "2"\n\nlinters:\n  default: none\n',
    )
    expect(validateYaml(report.text).valid).toBe(true)
  })

  it('enables arangolint only when ArangoDB is used', () => {
    const use = renderYamlDocument(
      deriveGolangciConfig({ arangoDbUsage: 'use' }),
    )
    const doNotUse = renderYamlDocument(
      deriveGolangciConfig({ arangoDbUsage: 'do-not-use' }),
    )

    expect(use.text).toBe(
      'version: "2"\n\nlinters:\n  default: none\n  enable:\n    - arangolint\n',
    )
    expect(doNotUse.text).toBe(
      'version: "2"\n\nlinters:\n  default: none\n',
    )
    expect(validateYaml(use.text).valid).toBe(true)
  })

  it('sorts linters contributed by independent decisions', () => {
    const document = renderYamlDocument(
      deriveGolangciConfig({
        ignoredErrors: 'report',
        arangoDbUsage: 'use',
      }),
    )

    expect(document.text).toBe(
      'version: "2"\n\nlinters:\n  default: none\n  enable:\n    - arangolint\n    - errcheck\n',
    )
    expect(validateYaml(document.text).valid).toBe(true)
  })

  it('returns to the same bytes after report, allow, report', () => {
    const first = renderYamlDocument(
      deriveGolangciConfig({ ignoredErrors: 'report' }),
    ).text
    const middle = renderYamlDocument(
      deriveGolangciConfig({ ignoredErrors: 'allow' }),
    ).text
    const last = renderYamlDocument(
      deriveGolangciConfig({ ignoredErrors: 'report' }),
    ).text

    expect(middle).not.toBe(first)
    expect(last).toBe(first)
  })

  it('rejects the removed v1 disable-all field', () => {
    const result = validateYaml(
      'version: "2"\n\nlinters:\n  disable-all: true\n',
    )

    expect(result.valid).toBe(false)
  })
})

describe('semantic YAML preview diff', () => {
  it('does not mark stable lines when a sorted sibling is inserted', () => {
    const previous: readonly RenderedYamlLine[] = [
      { id: 'linters.enable', text: '  enable:' },
      { id: 'linters.enable.errcheck', text: '    - errcheck' },
    ]
    const next: readonly RenderedYamlLine[] = [
      { id: 'linters.enable', text: '  enable:' },
      { id: 'linters.enable.bodyclose', text: '    - bodyclose' },
      { id: 'linters.enable.errcheck', text: '    - errcheck' },
    ]

    const diff = findChangedLines(previous, next)

    expect(diff.find((line) => line.id === 'linters.enable.bodyclose')?.change)
      .toBe('added')
    expect(diff.find((line) => line.id === 'linters.enable.errcheck')?.change)
      .toBeUndefined()
  })

  it('does not render or highlight lines absent from the next document', () => {
    const previous = renderYamlDocument(
      deriveGolangciConfig({ ignoredErrors: 'report' }),
    )
    const next = renderYamlDocument(
      deriveGolangciConfig({ ignoredErrors: 'allow' }),
    )

    const diff = findChangedLines(previous.lines, next.lines)

    expect(diff).toEqual(createPreviewYamlLines(next.lines))
    expect(hasYamlChanges(diff)).toBe(false)
    expect(next.text).not.toContain('errcheck')
  })
})
