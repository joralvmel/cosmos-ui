---
name: release
description: 'Runs the release flow: release PR develop → main, the Changesets "Version Packages" PR, npm publish with provenance and GitHub Releases; also snapshot prereleases with the next dist-tag.'
argument-hint: 'Release scope (stable or snapshot)'
agent: agent
---

Act as the `release-manager` agent ([definition](../agents/release-manager.agent.md)) and follow the skill
[release](../skills/release/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Release scope (stable or snapshot): ${input:arg1}
