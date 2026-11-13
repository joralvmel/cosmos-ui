---
name: create-component
description: 'Creates a new Cosmos component end-to-end following docs/conventions/component-anatomy.md: contract and scenarios, Lit Web Component, React and Angular wrappers, React Native component and demo, tests, docs pages (EN/ES), llms.md and changeset.'
argument-hint: 'Component name (kebab-case, without `cosm-`)'
agent: agent
---

Act as the `component-builder` agent ([definition](../agents/component-builder.agent.md)) and follow the skill
[create-component](../skills/create-component/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Component name (kebab-case, without `cosm-`): ${input:arg1}
- Purpose, props, events, slots, accessibility needs: ${input:arg2}

Follow the [component workflow](../../docs/conventions/component-workflow.md): research first,
then present feature/design recommendations and ask for scope approval before generation or
contract edits. Implement and test the accepted scope, create a local commit, and wait for user
validation before any push/PR. Do not treat the initial request as acceptance of unseen changes.
