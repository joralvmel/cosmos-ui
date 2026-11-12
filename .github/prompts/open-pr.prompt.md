---
name: open-pr
description: 'Pushes and opens or updates a work PR only after explicit approval of the current local review commit.'
argument-hint: 'Branch'
agent: agent
---

Act as the `github-ops` agent ([definition](../agents/github-ops.agent.md)) and follow the skill
[open-pr](../skills/open-pr/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Branch: ${input:arg1}
- Summary: ${input:arg2}

Follow the [component workflow](../../docs/conventions/component-workflow.md). Check that the user
has accepted the presented HEAD and that it is unchanged. Otherwise stop at the local review gate;
do not push, create a duplicate PR or infer approval from this prompt alone.
