import type { GolangciConfigV2 } from './types'

export function renderYaml(config: GolangciConfigV2): string {
  const lines = [
    `version: "${config.version}"`,
    '',
    'linters:',
    `  default: ${config.linters.default}`,
  ]

  if (config.linters.enable.length === 0) {
    lines.push('  enable: []')
  } else {
    lines.push('  enable:')
    lines.push(...config.linters.enable.map((linter) => `    - ${linter}`))
  }

  return `${lines.join('\n')}\n`
}
