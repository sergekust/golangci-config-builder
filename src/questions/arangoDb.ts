import type { QuestionDefinition } from './types'

export const arangoDbQuestion = {
  id: 'arangodb-usage',
  topic: 'Databases',
  position: 2,
  policyKey: 'arangoDbUsage',
  title: 'Do you use ArangoDB?',
  comment:
    'arangolint checks code written for the ArangoDB Go driver v2. It requires transactions to choose AllowImplicit explicitly, helping prevent accidental implicit collections and possible deadlocks, and rejects AQL built with dynamic string concatenation or fmt.Sprintf so values are passed safely through bind variables.',
  options: [
    {
      id: 'use',
      value: 'use',
      label: 'Yes, enable arangolint',
      description:
        'Require explicit transaction behavior and safe AQL parameter binding.',
      code: `// Allowed: transaction behavior is explicit.
options := &arangodb.BeginTransactionOptions{AllowImplicit: false}
db.BeginTransaction(ctx, arangodb.TransactionCollections{}, options)

// Allowed: dynamic values use bind variables.
vars := map[string]any{"name": name}
db.Query(ctx, "RETURN @name", &arangodb.QueryOptions{BindVars: vars})`,
    },
    {
      id: 'do-not-use',
      value: 'do-not-use',
      label: "No, I don't use ArangoDB",
      description: 'Do not enable checks for an unused database driver.',
      code: `// Forbidden: AllowImplicit is not explicit.
db.BeginTransaction(ctx, arangodb.TransactionCollections{}, nil)

// Forbidden: a dynamic value is concatenated into AQL.
query := "RETURN '" + name + "'"
db.Query(ctx, query, nil)`,
    },
  ],
} satisfies QuestionDefinition<'arangoDbUsage'>
