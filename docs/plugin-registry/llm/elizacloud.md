---
title: "Eliza Cloud Plugin"
sidebarTitle: "Eliza Cloud"
description: "Eliza Cloud model provider for Milady — managed model inference via elizaOS Cloud."
---

The Eliza Cloud plugin connects Milady agents to elizaOS Cloud's managed inference service, providing a unified API for multiple model providers without requiring individual API keys.

**Package:** `@elizaos/plugin-elizacloud`

## Installation

```bash
milady plugins install elizacloud
```

## Auto-Enable

The plugin auto-enables when `ELIZAOS_CLOUD_API_KEY` or `ELIZAOS_CLOUD_ENABLED` is present:

```bash
export ELIZAOS_CLOUD_API_KEY=your-key-here
# or
export ELIZAOS_CLOUD_ENABLED=true
```

## Configuration

| Environment Variable | Required | Description |
|---------------------|----------|-------------|
| `ELIZAOS_CLOUD_API_KEY` | Yes | elizaOS Cloud API key |
| `ELIZAOS_CLOUD_ENABLED` | No | Set `true` to enable without explicit key |

### milady.json Example

```json
{
  "auth": {
    "profiles": {
      "default": {
        "provider": "elizacloud"
      }
    }
  }
}
```

## Features

- Managed model inference — no individual provider API keys needed
- Access to multiple model providers through a single API
- Streaming responses
- Usage tracking and billing via elizaOS Cloud

## Related

- [OpenAI Plugin](/plugin-registry/llm/openai) — Direct OpenAI access
- [OpenRouter Plugin](/plugin-registry/llm/openrouter) — Alternative multi-provider routing
- [Model Providers](/runtime/models) — Compare all providers
