---
name: create-native-component
description: 'Creates a React Native component on a contract, core logic and tokens, with shared scenarios, drift test, demo screen and docs, following the component anatomy.'
argument-hint: 'Component name'
agent: agent
---

Act as the `native-expert` agent ([definition](../agents/native-expert.agent.md)) and follow the skill
[create-native-component](../skills/create-native-component/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Component name: ${input:arg1}
- Whether a web version exists (otherwise use the `native` generator target): ${input:arg2}
