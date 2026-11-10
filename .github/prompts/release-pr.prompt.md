---
name: release-pr
description: 'Opens the release pull request develop → main with the summary of pending changesets.'
argument-hint: 'Release name or notes (optional)'
agent: agent
---

Act as the `release-manager` agent ([definition](../agents/release-manager.agent.md)) and follow the skill
[release-pr](../skills/release-pr/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Release name or notes (optional): ${input:arg1}
