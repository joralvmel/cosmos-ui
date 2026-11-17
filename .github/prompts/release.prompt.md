---
name: release
description: 'Coordinates assessment, approved release PRs, publication checks, consumer tests and synchronization.'
argument-hint: 'Optional scope or release to resume'
agent: agent
---

Act as the `release-manager` agent ([definition](../agents/release-manager.agent.md)) and follow the skill
[release](../skills/release/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Optional scope or release to resume: ${input:arg1}
