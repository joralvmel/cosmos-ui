# ADR 0003: State ownership and event naming

- Status: accepted
- Date: 2026-11-10

## Context

Components expose state (value, open, selected tab…) that can be owned by the component or by the
application. Every platform has its own conventions for events. Without explicit rules, wrappers
re-implement behavior and controlled usage breaks.

## Decision

### Ownership

- Each public state is declared in the contract (`states: [{ prop, event, defaultProp }]`).
- **Unbound** state is autonomous: the component updates it and reports the change.
- **Bound** state is controlled: the component emits a _proposal_ event and does not commit the change
  until the application updates the prop. Falsy values (`false`, `0`, `''`) count as bound.
- Wrappers detect bindings (React: prop is not `undefined`; Angular: input was set) and pass that
  information to the element. Behavior always lives in Lit (web) or in the native component.
- Requests that can be refused (closing a dialog, leaving a step) are **cancelable** events; calling
  `preventDefault()` keeps the current state.

### Naming

| Concept          | DOM event               | React               | Angular             | React Native        |
| ---------------- | ----------------------- | ------------------- | ------------------- | ------------------- |
| Activation       | `cosm-press`            | `onPress`           | `(press)`           | `onPress`           |
| Value change     | `cosm-change`           | `onChange`          | `(valueChange)`     | `onValueChange`     |
| Open change      | `cosm-open-change`      | `onOpenChange`      | `(openChange)`      | `onOpenChange`      |
| Selection change | `cosm-selection-change` | `onSelectionChange` | `(selectionChange)` | `onSelectionChange` |

- DOM events are `CustomEvent`s with typed `detail`, `bubbles: true`, `composed: true`.
- React and Angular receive the original `CustomEvent`. React Native callbacks receive the `detail`.
- Detail types are named `<Component><Event>Detail` and exported from core.
- No prefixed aliases (`onCosmChange`, `cosmChange`) in wrappers.

## Consequences

- Shared scenarios cover autonomous and controlled usage for every stateful component.
- Drift tests compare wrapper event names with `eventNames(contract, platform)`.
