import type { ReactNode } from 'react'

type CodeSampleProps = {
  source: string
}

const goKeywords = new Set([
  'break',
  'case',
  'chan',
  'const',
  'continue',
  'default',
  'defer',
  'else',
  'fallthrough',
  'for',
  'func',
  'go',
  'goto',
  'if',
  'import',
  'interface',
  'map',
  'package',
  'range',
  'return',
  'select',
  'struct',
  'switch',
  'type',
  'var',
])

const goBuiltins = new Set([
  'bool',
  'byte',
  'error',
  'false',
  'int',
  'nil',
  'rune',
  'string',
  'true',
])

const tokenPattern = /(\/\/.*$|"(?:\\.|[^"\\])*"|`[^`]*`|\b[A-Za-z_]\w*\b)/g

function tokenClass(token: string, line: string, endIndex: number): string {
  if (token.startsWith('//')) return 'token-comment'
  if (token.startsWith('"') || token.startsWith('`')) return 'token-string'
  if (goKeywords.has(token)) return 'token-keyword'
  if (goBuiltins.has(token)) return 'token-builtin'
  if (/^[A-Z]/.test(token)) return 'token-type'

  const followingText = line.slice(endIndex).trimStart()
  if (followingText.startsWith('(')) return 'token-function'

  return ''
}

function highlightGoLine(line: string): ReactNode[] {
  const tokens: ReactNode[] = []
  let cursor = 0

  for (const match of line.matchAll(tokenPattern)) {
    const index = match.index
    const token = match[0]

    if (index > cursor) {
      tokens.push(line.slice(cursor, index))
    }

    const className = tokenClass(token, line, index + token.length)
    tokens.push(
      className ? (
        <span className={className} key={`${index}-${token}`}>
          {token}
        </span>
      ) : (
        token
      ),
    )
    cursor = index + token.length
  }

  if (cursor < line.length) {
    tokens.push(line.slice(cursor))
  }

  return tokens
}

export function CodeSample({ source }: CodeSampleProps) {
  const lines = source.split('\n')

  return (
    <figure className="code-sample">
      <figcaption className="code-sample__caption">
        <span>Example</span>
        <span>Go</span>
      </figcaption>
      <pre aria-label="Go code example" tabIndex={0}>
        <code>
          {lines.map((line, index) => (
            <span className="code-line" key={`${index}-${line}`}>
              <span className="code-line__source">
                {highlightGoLine(line)}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </figure>
  )
}
