import type { QuestionDefinition } from './types'

export const ignoredErrorsQuestion = {
  id: 'ignored-errors',
  topic: 'Errors',
  position: 1,
  policyKey: 'ignoredErrors',
  title: 'Should ignored errors be reported?',
  comment:
    'A returned error can carry the only signal that cleanup or persistence failed. Choose whether such errors must be handled explicitly.',
  options: [
    {
      id: 'report',
      value: 'report',
      label: 'Report ignored errors',
      description: 'Require returned errors to be handled explicitly.',
      code: `func save(file *os.File) error {
    if err := file.Close(); err != nil {
        return err
    }

    return nil
}`,
      recommended: true,
    },
    {
      id: 'allow',
      value: 'allow',
      label: 'Allow ignored errors',
      description: 'Allow returned errors to be ignored.',
      code: `func save(file *os.File) error {
    file.Close()
    return nil
}`,
    },
  ],
} satisfies QuestionDefinition<'ignoredErrors'>
