# ADR 0001: Platforms and component contracts

- Status: accepted
- Date: 2026-11-10

## Context

Cosmos UI targets the web (framework-agnostic and inside React and Angular apps) and React Native.
Web Components cannot run in React Native, so a single view implementation for every platform is not
possible. Without a shared source of truth, platforms drift: props get different names, events fire
with different payloads and accessibility behavior diverges.

## Decision

1. Every component starts as a **contract** in `packages/core/src/specs/<name>.ts`, created with
   `defineContract`: props (type, default, platforms, reflection), events with their name per platform,
   public states and their owner, slots, CSS parts, CSS custom properties, ARIA role, reference pattern
   and keyboard map.
2. Platform-neutral behavior lives in **headless** modules in `packages/core/src/headless/` (pure
   TypeScript, no DOM).
3. **Shared scenarios** (`<name>.scenarios.ts`) describe behavior as "props + actions → expected
   events and state". Web, React, Angular and React Native tests run them through small drivers.
4. Views per platform: Lit (`packages/elements`) for the web, thin generated wrappers for React and
   Angular, hand-written React Native components (`packages/native`).
5. **Drift tests** in every package fail when a platform exposes a prop or event that is not in the
   contract, or misses one. Platform prop types derive from the contract (`ContractProps`).

## Consequences

- Adding or changing an API always starts in core and fans out through the generator and the
  `modify-component` skill.
- Docs (API tables), AI references (`llms.md`) and the MCP server read the same contracts.
- React Native parity is checked by behavior and API, not by sharing view code.
