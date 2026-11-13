---
name: commit
description: 'Creates a validated local Conventional Commit and pauses for review without pushing; revisions create new commits.'
argument-hint: 'Change summary'
agent: agent
---

Act as the `github-ops` agent ([definition](../agents/github-ops.agent.md)) and follow the skill
[commit](../skills/commit/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Change summary: ${input:arg1}
