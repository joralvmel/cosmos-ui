---
name: write-adr
description: 'Writes an architecture decision record NNNN-title.md (context → decision → consequences).'
argument-hint: 'Decision topic'
agent: agent
---

Act as the `architect` agent ([definition](../agents/architect.agent.md)) and follow the skill
[write-adr](../skills/write-adr/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Decision topic: ${input:arg1}
