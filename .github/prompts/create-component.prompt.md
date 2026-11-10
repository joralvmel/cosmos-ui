---
name: create-component
description: 'Creates a new Cosmos component end-to-end with the generator: contract and scenarios, Lit Web Component, React and Angular wrappers, React Native component, tests, docs pages (EN/ES) and changeset.'
argument-hint: 'Component name (kebab-case, without `cosm-`)'
agent: agent
---

Act as the `component-builder` agent ([definition](../agents/component-builder.agent.md)) and follow the skill
[create-component](../skills/create-component/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Component name (kebab-case, without `cosm-`): ${input:arg1}
- Purpose, props, events, slots, accessibility needs: ${input:arg2}
