---
name: verify-identity
description: 'Checks the Git and GitHub identity before a commit or push. Enforces .local/git-identity.json when it exists; otherwise reports the current identity and asks for confirmation.'
argument-hint: 'No input needed'
agent: agent
---

Act as the `github-ops` agent ([definition](../agents/github-ops.agent.md)) and follow the skill
[verify-identity](../skills/verify-identity/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).
