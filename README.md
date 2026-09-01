# Go lint policy builder

A static React application for building a `golangci-lint` configuration from concrete engineering-policy decisions.

The product deliberately keeps user intent separate from generated YAML:

```text
policy answers → golangci-lint rules → typed config → YAML
```

The first implemented decision asks how ignored errors should be handled. The preview is regenerated deterministically whenever that answer changes.

## Development

Requirements:

- Node.js 20.19 or newer (or Node.js 22.12+)
- npm

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

Useful checks:

```sh
npm run lint
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

## Project structure

```text
src/
  components/  reusable decision and preview UI
  config/      policy-to-rule derivation and YAML rendering
  policy/      user-intent types, defaults, and updates
  questions/   data definitions for engineering decisions
```

`Policy` is the only configuration source of truth. The typed configuration object and YAML are derived values and are never edited by UI components.

## Static hosting

The Vite build uses a relative asset base, so the contents of `dist/` can be hosted at a GitHub Pages project path without hard-coded repository URLs. Run `npm run build`, then publish the generated `dist/` directory as the Pages artifact. No server-side fallback is required because this first version does not use client-side routes.

Deployment automation is intentionally left to the hosting repository rather than bundled into this foundation.
