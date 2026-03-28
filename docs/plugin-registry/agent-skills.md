---
title: Agent Skills Plugin
sidebarTitle: Agent Skills
description: Enable agent skill execution using @elizaos/plugin-agent-skills.
---

Provides the skill execution framework for agents, allowing them to discover, load, and run skills from the skills marketplace or local skill packs.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-agent-skills` |
| Feature flag | `features.agentSkills` |
| Core plugin | Included by default in the core plugin set |

## Configuration

Agent skills are part of the core plugin set and are loaded by default. To explicitly control:

```json
{
  "features": {
    "agentSkills": true
  }
}
```

## Related

- [Skills guide](/plugins/skills) -- creating and using agent skills
- [Skills streaming](/skills/streaming) -- streaming results from skills
