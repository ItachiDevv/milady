---
title: "Minimax Plugin"
sidebarTitle: "Minimax"
description: "Minimax provider for Milady — access MiniMax language and multimodal models."
---

The Minimax plugin connects Milady agents to MiniMax's language and multimodal models.

**Package:** `@elizaos/plugin-minimax`

## Installation

```bash
milady plugins install minimax
```

## Configuration

Minimax does not currently auto-enable via environment variable. Enable it manually in your config:

### milady.json Example

```json
{
  "plugins": {
    "allow": ["@elizaos/plugin-minimax"]
  },
  "auth": {
    "profiles": {
      "default": {
        "provider": "minimax"
      }
    }
  }
}
```

## Related

- [OpenRouter Plugin](/plugin-registry/llm/openrouter) — Access MiniMax models via OpenRouter
- [Model Providers](/runtime/models) — Compare all providers
