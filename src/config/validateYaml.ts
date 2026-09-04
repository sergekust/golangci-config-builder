import Ajv, { type ErrorObject } from 'ajv'
import { parse } from 'yaml'
import golangciSchema from './schema/golangci-2.13.2.json'

export type YamlValidationResult =
  | { valid: true; errors: readonly [] }
  | { valid: false; errors: readonly string[] }

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  validateFormats: false,
})
const validateConfig = ajv.compile(golangciSchema)

function formatSchemaError(error: ErrorObject): string {
  const location = error.instancePath || '/'
  return `${location}: ${error.message ?? 'schema validation failed'}`
}

export function validateYaml(yaml: string): YamlValidationResult {
  let value: unknown

  try {
    value = parse(yaml)
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : 'Invalid YAML'],
    }
  }

  if (validateConfig(value)) {
    return { valid: true, errors: [] }
  }

  return {
    valid: false,
    errors: (validateConfig.errors ?? []).map(formatSchemaError),
  }
}
