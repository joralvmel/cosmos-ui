---
name: release
description: 'Runs the version and publish flow with Changesets, provenance and the pre-release checklist.'
argument-hint: 'Release scope'
agent: agent
---

Act as the `release-manager` agent ([definition](../agents/release-manager.agent.md)) and follow the skill
[release](../skills/release/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Release scope: ${input:arg1}
