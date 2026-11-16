---
name: adopt-docs-components
description: 'Updates docs-owned controls to use stable Cosmos components after an inventory and scope review.'
argument-hint: 'Optional component names or docs areas'
agent: agent
---

Act as the `docs-writer` agent ([definition](../agents/docs-writer.agent.md)) and follow
[adopt-docs-components](../skills/adopt-docs-components/SKILL.md) together with
[AGENTS.md](../../AGENTS.md).

- Requested components or docs areas (optional): ${input:arg1}

Treat this as a separate docs task. Inspect availability and propose the replacement mapping before
edits; wait for scope approval. Keep native controls without a compatible stable equivalent.
Finish with a validated local commit and wait without push or PR.
