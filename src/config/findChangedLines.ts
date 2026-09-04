import type { RenderedYamlLine } from './renderYaml'

export type YamlLineChange = 'added' | 'modified'

export type PreviewYamlLine = RenderedYamlLine & {
  change?: YamlLineChange
  lineNumber: number
}

export function createPreviewYamlLines(
  lines: readonly RenderedYamlLine[],
): readonly PreviewYamlLine[] {
  return lines.map((line, index) => ({
    ...line,
    lineNumber: index + 1,
  }))
}

export function findChangedLines(
  previousLines: readonly RenderedYamlLine[],
  nextLines: readonly RenderedYamlLine[],
): readonly PreviewYamlLine[] {
  const previousById = new Map(previousLines.map((line) => [line.id, line]))
  return nextLines.map((line, index) => {
    const previousLine = previousById.get(line.id)
    const change = previousLine
      ? previousLine.text === line.text
        ? undefined
        : 'modified'
      : 'added'

    return {
      ...line,
      ...(change ? { change } : {}),
      lineNumber: index + 1,
    }
  })
}

export function hasYamlChanges(lines: readonly PreviewYamlLine[]): boolean {
  return lines.some((line) => line.change !== undefined)
}
