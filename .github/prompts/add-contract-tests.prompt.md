---
name: add-contract-tests
description: 'Adds shared behavior scenarios to a contract and runs them on the web, React, Angular and React Native through drivers.'
argument-hint: 'Component name'
agent: agent
---

Act as the `test-engineer` agent ([definition](../agents/test-engineer.agent.md)) and follow the skill
[add-contract-tests](../skills/add-contract-tests/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Component name: ${input:arg1}
- Behavior to cover: ${input:arg2}
