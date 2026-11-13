---
name: upgrade-stack
description: 'Plan and perform an upgrade of the pinned stack or a major dependency, or fix a vulnerability that needs more than a patch.'
argument-hint: 'Package or group and target version, or the dependency/security issue'
agent: agent
---

Follow [upgrade-stack](../skills/upgrade-stack/SKILL.md) and [AGENTS.md](../../AGENTS.md).

- What to upgrade (or issue URL): ${input:arg1}
- Constraints (platforms first, breaking release acceptable?): ${input:arg2}

Research compatibility and migration guides first and present the plan. Do not change manifests
before my approval. Finish with a validated local commit and wait for my review.
