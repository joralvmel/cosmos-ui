---
name: commit
description: 'Creates a Conventional Commit on a work branch after verifying identity, running validation and the blocked-terms check.'
argument-hint: 'Change summary'
agent: agent
---

Act as the `github-ops` agent ([definition](../agents/github-ops.agent.md)) and follow the skill
[commit](../skills/commit/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Change summary: ${input:arg1}
