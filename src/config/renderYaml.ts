import type { GolangciConfigV2 } from './types'

export type RenderedYamlLine = {
  id: string
  text: string
}

export type RenderedYamlDocument = {
  text: string
  lines: readonly RenderedYamlLine[]
}

export function renderYamlLines(
  config: GolangciConfigV2,
): readonly RenderedYamlLine[] {
  const lines: RenderedYamlLine[] = [
    { id: 'version', text: `version: "${config.version}"` },
    { id: 'separator.after-version', text: '' },
    { id: 'linters', text: 'linters:' },
    { id: 'linters.default', text: `  default: ${config.linters.default}` },
  ]

  if (config.linters.enable && config.linters.enable.length > 0) {
    lines.push({ id: 'linters.enable', text: '  enable:' })
    lines.push(
      ...config.linters.enable.map((linter) => ({
        id: `linters.enable.${linter}`,
        text: `    - ${linter}`,
      })),
    )
  }

  return lines
}

export function renderYamlDocument(
  config: GolangciConfigV2,
): RenderedYamlDocument {
  const lines = renderYamlLines(config)

  return {
    text: `${lines.map((line) => line.text).join('\n')}\n`,
    lines,
  }
}
