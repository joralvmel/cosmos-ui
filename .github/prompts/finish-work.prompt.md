---
name: finish-work
description: 'Finishes a task: validates, pushes the branch and opens a pull request to develop with the template filled, labels and reviewers; optionally requests a Copilot review.'
argument-hint: 'Pull request title (Conventional Commits)'
agent: agent
---

Act as the `github-ops` agent ([definition](../agents/github-ops.agent.md)) and follow the skill
[finish-work](../skills/finish-work/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Pull request title (Conventional Commits): ${input:arg1}
- Issue number (optional): ${input:arg2}
