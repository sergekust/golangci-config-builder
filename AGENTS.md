# Product and Architecture Contract

## Product

This repository contains a browser-only single-page application for GitHub Pages. It helps an experienced Go developer produce a `golangci-lint` configuration quickly while retaining explicit control over every policy decision.

The primary product properties are predictability and reproducibility. Given the same application version and the same `Policy`, the application must produce the exact same YAML bytes. Generation happens entirely in the browser and must not depend on network access, remote APIs, analytics, or server-side state.

The product eventually covers every relevant section of the `golangci-lint` v2 configuration, not only `linters`. Add that support incrementally with the questions that require it. Do not model the entire upstream schema speculatively.

## Target `golangci-lint` Version

- Target exactly one concrete upstream version at a time. The current target is `golangci-lint` **2.13.2**, which is the latest version selected for this application revision.
- Display the target version in the UI.
- Do not build a version selector, compatibility layer, version adapter, or support for older configurations.
- Updating to a newer `latest` is a separate, focused pull request. That pull request may rewrite questions, policy mappings, typed configuration models, the pinned official schema, canonical output, and any other version-specific code.
- Keep the official schema for the target version pinned locally. Parse and validate the canonical YAML against that schema in the browser before it can be copied. Runtime generation and validation must never fetch the schema from the network.
- Do not add the application version or target version as a YAML comment. That is a future feature.

## Empty Configuration and Presets

Every new session and every reset starts with an unanswered policy and this exact valid v2 YAML, including the blank line and final newline:

```yaml
version: "2"

linters:
  default: none
```

Do not emit `linters.enable: []` for the empty configuration.

The application has no product presets. Do not add choices such as “Practical”, “Strict”, or another bundle that silently answers several questions. Every decision must be made explicitly by the user. Upstream `golangci-lint` features whose names include “preset” are not categorically forbidden; a future question may deliberately expose one.

A `recommended` option is presentation metadata only. It may render a badge, but it must never select an option, initialize `Policy`, change navigation, or affect YAML generation.

## Architectural Flow

Keep the main dependency direction explicit:

```text
question catalog -> Policy -> typed golangci-lint v2 config -> canonical YAML
                                                         -> rendered lines for preview
```

`Policy` is the sole source of truth for answers. Do not introduce a parallel `AnswerSet`, form-state mirror, or YAML-backed answer model. A choice updates its policy field directly; use normal immutable state updates in the UI. An unset field means “not answered.” An explicit allow/off value means “answered, with no corresponding rule emitted” and is not the same as an unset field.

Configuration and YAML are derived from the complete current `Policy`; never patch generated YAML in response to a choice. Returning from policy A to policy B and back to A must restore A's YAML byte-for-byte, independently of the order in which choices were made.

Questions and options may know a `Policy` key and semantic policy values. They must not know YAML paths, YAML fragments, config section names, serialization order, or the linter/settings mechanics required to implement the choice. Keep those mappings in the policy-to-config derivation layer.

The typed config model is version-specific and contains only the portions needed by implemented questions. The renderer is responsible for YAML syntax and canonical ordering. Do not let React components construct configuration objects or YAML.

## Question Catalog

Question content lives in code. A question currently has:

- a stable ID;
- an English title;
- an English explanatory comment;
- a topic;
- a hard-coded position;
- one `Policy` key;
- a finite set of single-choice options.

Each option has a stable ID, label, description, semantic policy value, optional `recommended` presentation metadata, and an optional Go code sample.

Code samples belong to options, not to the question. Do not add question-level sample code. Keep all option cards visible together, but render one option sample at a time in the existing central code area rather than inside an option card. Hovering or focusing an option previews its sample without changing `Policy`; leaving it restores the selected option's sample. Selecting an option changes both `Policy` and the active sample. Two options may use the same source when their descriptions or comments explain different policies. Samples are content only and must not contain config-generation knowledge.

Render the question's explanatory comment as a paragraph below the central code area and before the choices.

The current ignored-errors question is binary: one option reports ignored errors by enabling the relevant linter, and the other explicitly allows ignored errors without enabling it. Do not retain a “Practical” versus “Strict” split for this question.

English is the only content language for now. Go is the only example language for now. Localization and multiple samples per option are separate future features.

Derive catalog metadata instead of duplicating it:

- `total` is the number of question objects in the catalog; do not store it on each question.
- The available topic set is collected dynamically from every question's `topic`; do not maintain a separate topic registry.
- `position` remains explicit question content for now.

Avoid questions whose options derive the same effective configuration. If independent contributors emit the same config value, deduplicate it. If they assign different values to the same setting, treat that as a programming error; never resolve it with hidden last-write-wins behavior.

## Question Flow

- Start with no option selected.
- Selecting an option updates `Policy` and the YAML preview immediately.
- An explicit allow/off option still marks the question as answered even when YAML does not change.
- Disable `Continue` until the current question is answered. There is no implicit or explicit skip in the current flow.
- `Continue` advances through a linear catalog. Provide `Back` for the preceding question.
- After the last question, show a success screen while retaining the generated YAML preview.
- Reset clears the entire `Policy`, returns to the first question, restores the exact empty configuration, and does not show a change highlight.
- A page reload starts a new empty session. Do not persist answers.

## Canonical Configuration and YAML

- Derivation must be deterministic and free of UI state.
- Sort emitted linter names alphabetically. Sort settings keys alphabetically unless a later version-specific requirement explicitly establishes another canonical order.
- Deduplicate identical contributions.
- Treat conflicting contributions as programming errors.
- Preserve exact formatting, key order, quoting, blank lines, and the final newline as part of the renderer contract.
- Keep the preview read-only. Copy operations copy only the canonical current YAML.
- Do not generate explanatory comments in YAML yet.
- Do not dump unrelated upstream defaults into the generated file. When a user explicitly answers a question for a setting that is active in the generated configuration, serialize that decision even when its value equals the upstream default.

## Change Preview

Change highlighting is a product feature and must survive architectural changes.

- Give rendered YAML lines stable semantic IDs, such as `version`, `linters.default`, or `linters.enable.errcheck`.
- Compare revisions by semantic ID and content, not by line number. Reordering or inserting one node must not make unrelated shifted lines appear changed.
- Highlight actual additions and modifications.
- Keep the current diff visible until the next state-changing or navigation action; a new selection replaces the previous diff.
- Automatically scroll the preview to the first changed line when it is outside the viewport.
- If a policy decision changes but canonical YAML does not, do not manufacture a YAML diff.
- Reset clears all diff state and renders the empty baseline without highlighting it.

The precise color treatment for added and changed lines is not an architectural constraint yet.

## Static and Offline Constraints

- The application is a static GitHub Pages SPA. Do not require a backend or server-side rendering.
- Make routing and asset paths work from a GitHub Pages repository subpath.
- Bundle the question catalog, policy mappings, generation logic, and other required data with the application.
- Once loaded, the complete question flow and configuration generation must work without network access.
- Support current Chrome and Safari. Do not add legacy-browser compatibility layers without a separate product decision.
- Do not add runtime API calls, analytics, remote configuration, or a remote schema dependency.
- Links to official linter documentation may be included when useful, but following a link is an explicit user action and must not be required for generation.

## Deferred Work

Do not include the following as incidental parts of another change. Each requires a separate feature or explicit product decision:

- localization;
- multiple code samples per option;
- skip behavior;
- topic navigation and arbitrary question navigation;
- conditional or non-linear questions;
- a separate human-readable policy summary;
- reset confirmation;
- YAML comments or generator/version metadata;
- editable YAML or importing an existing configuration;
- downloading a `.golangci.yml` file;
- shareable URLs, answer manifests, or policy exports;
- `localStorage`, session restoration, or migration of saved sessions;
- multiple target versions or backwards compatibility;
- automated GitHub Pages deployment or a custom domain;
- analytics or runtime network integrations.

Implement new questions and new config sections in separate feature work. Preserve these product invariants and architectural boundaries while doing so.
