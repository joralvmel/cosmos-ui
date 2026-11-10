---
name: update-ai-references
description: 'Keeps every AI reference in sync with the code: llms.md blocks (npm run llms), docs .md pages, /llms.txt, /llms-full.txt, the MCP server data and tools, and cosmos init-ai.'
argument-hint: 'Packages or components changed'
agent: agent
---

Act as the `ai-tooling` agent ([definition](../agents/ai-tooling.agent.md)) and follow the skill
[update-ai-references](../skills/update-ai-references/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Packages or components changed: ${input:arg1}
