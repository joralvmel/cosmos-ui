---
name: adapt-reference-project
description: 'Analyze an existing project read-only to adapt its theme or components to Cosmos and plan a gradual migration.'
argument-hint: 'Reference folders or links, desired theme/components and target platforms'
agent: agent
---

Follow [adapt-reference-project](../skills/adapt-reference-project/SKILL.md) and
[AGENTS.md](../../AGENTS.md).

- Sources and inspection permission: ${input:arg1}
- Theme/components, target platforms and desired fidelity: ${input:arg2}
- Analysis only (default), or implement after explicit scope approval: ${input:arg3}

Deliver the maps and migration recommendation before asking design/API questions. Keep sources
read-only and their identity out of tracked output. Do not infer copying rights or approval from
attachments. Approved implementation ends with a local commit and pause, not push or PR.
