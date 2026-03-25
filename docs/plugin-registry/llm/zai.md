---
title: "z.ai Plugin"
sidebarTitle: "z.ai"
description: "z.ai model provider for Milady — GLM models via the z.ai Coding Plan from Homunculus Labs."
---

The z.ai plugin connects Milady agents to GLM models through the z.ai Coding Plan, provided by Homunculus Labs.

**Package:** `@homunculuslabs/plugin-zai`

## Installation

```bash
milady plugins install @homunculuslabs/plugin-zai
```

## Auto-Enable

The plugin auto-enables when `ZAI_API_KEY` is present:

```bash
export ZAI_API_KEY=your-zai-api-key
```

The legacy `Z_AI_API_KEY` variable is also supported and automatically normalized to `ZAI_API_KEY`.

## Configuration

| Environment Variable | Required | Description |
|---------------------|----------|-------------|
| `ZAI_API_KEY` | Yes | z.ai API key |
| `Z_AI_API_KEY` | No | Legacy alias (auto-migrated to `ZAI_API_KEY`) |

### milady.json Example

```json
{
  "env": {
    "ZAI_API_KEY": "your-zai-api-key"
  }
}
```

## Features

- GLM model access via z.ai Coding Plan
- Supports primary model override

## Related

- [Model Providers](/runtime/models) -- Compare all providers
- [OpenRouter Plugin](/plugin-registry/llm/openrouter) -- Multi-provider routing
