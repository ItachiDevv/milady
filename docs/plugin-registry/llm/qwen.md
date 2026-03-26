---
title: "Qwen Plugin"
sidebarTitle: "Qwen"
description: "Qwen provider for Milady — access Alibaba Cloud's Qwen language models."
---

The Qwen plugin connects Milady agents to Alibaba Cloud's Qwen family of language models.

**Package:** `@elizaos/plugin-qwen`

## Installation

```bash
milady plugins install qwen
```

## Configuration

Qwen does not currently auto-enable via environment variable. Enable it manually in your config:

### milady.json Example

```json
{
  "plugins": {
    "allow": ["@elizaos/plugin-qwen"]
  },
  "auth": {
    "profiles": {
      "default": {
        "provider": "qwen"
      }
    }
  }
}
```

## Related

- [OpenRouter Plugin](/plugin-registry/llm/openrouter) — Access Qwen models via OpenRouter
- [Model Providers](/runtime/models) — Compare all providers
