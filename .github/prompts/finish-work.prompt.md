---
name: finish-work
description: 'Validates implementation work, creates a local commit and pauses for user testing; pushes and opens a PR only after approval of that HEAD.'
argument-hint: 'Pull request title (Conventional Commits)'
agent: agent
---

Act as the `github-ops` agent ([definition](../agents/github-ops.agent.md)) and follow the skill
[finish-work](../skills/finish-work/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Pull request title (Conventional Commits): ${input:arg1}
- Issue number (optional): ${input:arg2}

Follow the [component workflow](../../docs/conventions/component-workflow.md): automatically commit
validated task changes locally, report the SHA and local test steps, then stop without push/PR.
Requested revisions get new commits and another pause. Resume remote delivery only after explicit
acceptance of the unchanged reviewed HEAD, not merely because this prompt was invoked.
