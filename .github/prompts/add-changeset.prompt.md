---
name: add-changeset
description: 'Writes a Changesets release note for every publishable package changed in the branch.'
argument-hint: 'Branch or change description'
agent: agent
---

Act as the `release-manager` agent ([definition](../agents/release-manager.agent.md)) and follow the skill
[add-changeset](../skills/add-changeset/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Branch or change description: ${input:arg1}
