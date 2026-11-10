# ADR 0005: Icons based on Lucide

- Status: accepted
- Date: 2026-11-10

## Context

Components and applications need a consistent icon set that works on the web (Web Components, React,
Angular) and in React Native, without rendering HTML strings.

## Decision

- The base set is **Lucide** (ISC license), consumed from its npm package.
- A build script in `packages/icons` reads the SVG sources, optimizes them and generates one ESM
  module per icon with a structured, framework-neutral definition (`IconDefinition`: name, viewBox and
  a list of `[tag, attributes]` nodes), plus a catalog with categories and tags.
- Renderers build elements from the definition: `<cosm-icon>` on the web and an `Icon` component on
  React Native (`react-native-svg`). Untrusted definitions are validated with `isIconDefinition`.
- The Lucide license is shipped with the package and recorded in `THIRD_PARTY_NOTICES.md`.
- Icons drawn for Cosmos follow the Lucide grid (24×24, 2px stroke) and are marked as Cosmos-owned.

## Consequences

- Updating Lucide is a routine task (`sync-icons` skill) that regenerates definitions and the catalog.
- Per-icon modules keep bundles small; there is no global name registry.
