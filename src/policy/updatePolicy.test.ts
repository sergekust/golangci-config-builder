import { describe, expect, it } from 'vitest'
import { EMPTY_POLICY } from './defaults'
import { updatePolicy } from './updatePolicy'

describe('updatePolicy', () => {
  it('keeps the original policy immutable and records an explicit answer', () => {
    const nextPolicy = updatePolicy(EMPTY_POLICY, 'ignoredErrors', 'allow')

    expect(EMPTY_POLICY).toEqual({})
    expect(nextPolicy).toEqual({ ignoredErrors: 'allow' })
    expect(nextPolicy).not.toBe(EMPTY_POLICY)
  })

  it('records an explicit no-use answer without enabling a linter', () => {
    const nextPolicy = updatePolicy(
      EMPTY_POLICY,
      'arangoDbUsage',
      'do-not-use',
    )

    expect(nextPolicy).toEqual({ arangoDbUsage: 'do-not-use' })
  })
})
