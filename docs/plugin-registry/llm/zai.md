---
title: "z.ai Plugin"
sidebarTitle: "z.ai"
description: "z.ai provider for Milady — access GLM models via z.ai Coding Plan."
---

The z.ai plugin connects Milady agents to GLM models via z.ai's inference API.

**Package:** `@homunculuslabs/plugin-zai`

## Installation

```bash
milady plugins install zai
```

## Auto-Enable

The plugin auto-enables when `ZAI_API_KEY` is present:

```bash
export ZAI_API_KEY=your-zai-api-key
```

The alias `Z_AI_API_KEY` is also recognized and normalized to `ZAI_API_KEY`.

## Configuration

| Environment Variable | Required | Description |
|---------------------|----------|-------------|
| `ZAI_API_KEY` | Yes | z.ai API key |

### milady.json Example

```json
{
  "auth": {
    "profiles": {
      "default": {
        "provider": "zai"
      }
    }
  }
}
```

## Features

- GLM model access via z.ai Coding Plan
- API key-based authentication

## Related

- [OpenRouter Plugin](/plugin-registry/llm/openrouter) — Route between multiple providers
- [Model Providers](/runtime/models) — Compare all providers
