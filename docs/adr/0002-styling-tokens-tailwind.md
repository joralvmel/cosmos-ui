# ADR 0002: Styling with Cosmos tokens and Tailwind CSS v4

- Status: accepted
- Date: 2026-11-10

## Context

Consumers style applications with a utility framework, AI assistants generate Tailwind classes by
default, and components must work in Shadow DOM, React Native and server-rendered apps. Two options
were evaluated: a custom utility engine or Tailwind CSS v4 on top of Cosmos tokens.

| Criterion              | Custom engine                                 | Tailwind v4 + tokens                     |
| ---------------------- | --------------------------------------------- | ---------------------------------------- |
| AI friendliness        | Needs translation tables and class validators | Known by every assistant                 |
| Shadow DOM             | Utilities do not reach shadow roots           | Same; components use tokens              |
| React Native           | Engine must be ported                         | NativeWind (optional) plus token objects |
| Framework integrations | Own Vite/PostCSS/CLI plugins to maintain      | Official plugins                         |
| Maintenance            | Scanner, variants, HMR, docs                  | One generated theme file                 |

## Decision

- `@joralvmel/cosmos-tokens` is the single source of truth (primitives, semantic colors and themes). It
  generates `tokens.css` (`--cosm-*` per theme and mode), a Tailwind v4 `@theme`, React Native values
  and JSON.
- `@joralvmel/cosmos-tailwind` ships the theme plus `dark:` and `theme-<name>:` variants. Tailwind is an
  **optional** peer dependency; components work with `tokens.css` alone. Default Tailwind colors are
  removed so only tokens are used.
- Web Components style themselves with Lit `css`, `var(--cosm-*, fallback)`, component hooks
  (`--cosm-<component>-*`) and `::part`. They never depend on Tailwind.
- React Native components read numeric values from `@joralvmel/cosmos-tokens/native` through
  `CosmosThemeProvider`.
- No custom CSS engine is built.

## Consequences

- Tailwind upgrades only affect the generated theme file and its compile test.
- New tokens must be added to every output (`add-token` skill).
