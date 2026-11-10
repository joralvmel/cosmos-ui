---
name: update-ai-references
description: 'Regenerates and validates llms.md, llms.txt and the MCP tools so AI assistants match the real API.'
argument-hint: 'Packages or components changed'
agent: agent
---

Act as the `ai-tooling` agent ([definition](../agents/ai-tooling.agent.md)) and follow the skill
[update-ai-references](../skills/update-ai-references/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Packages or components changed: ${input:arg1}
