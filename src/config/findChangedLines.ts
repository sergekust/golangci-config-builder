export function findChangedLineNumbers(
  previousYaml: string,
  nextYaml: string,
): readonly number[] {
  const previousLines = previousYaml.trimEnd().split('\n')
  const nextLines = nextYaml.trimEnd().split('\n')

  return nextLines.flatMap((line, index) =>
    line === previousLines[index] ? [] : [index + 1],
  )
}
