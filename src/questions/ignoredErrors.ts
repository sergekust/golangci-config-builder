import type { QuestionDefinition } from './types'

export const ignoredErrorsQuestion = {
  id: 'ignored-errors',
  group: 'Errors',
  position: 1,
  total: 8,
  policyKey: 'ignoredErrors',
  prompt: 'Should ignored errors be reported?',
  explanation:
    'A returned error can carry the only signal that cleanup or persistence failed. Choose how consistently your team wants that signal checked.',
  code: {
    language: 'go',
    filename: 'save.go',
    source: `func save(file *os.File) error {
    file.Close()
    return nil
}`,
  },
  options: [
    {
      value: 'practical',
      label: 'Practical',
      description: 'Catch ignored errors in meaningful situations.',
      recommended: true,
    },
    {
      value: 'strict',
      label: 'Strict',
      description: 'Report all unchecked errors where possible.',
    },
    {
      value: 'off',
      label: 'Off',
      description: 'Do not enforce ignored-error checking.',
    },
  ],
} satisfies QuestionDefinition<'ignoredErrors'>
