---
title: "MiniMax Plugin"
sidebarTitle: "MiniMax"
description: "MiniMax model provider for Milady — MiniMax large language models."
---

The MiniMax plugin connects Milady agents to MiniMax's language models, providing access to MiniMax's AI inference services.

**Package:** `@elizaos/plugin-minimax`

## Installation

```bash
milady plugins install minimax
```

## Auto-Enable

The plugin auto-enables when configured as an auth profile provider.

## Configuration

### milady.json Example

```json
{
  "auth": {
    "profiles": {
      "default": {
        "provider": "minimax"
      }
    }
  }
}
```

## Features

- Large language model inference
- Streaming responses
- Multi-turn conversation

## Related

- [OpenAI Plugin](/plugin-registry/llm/openai) — General-purpose alternative
- [Model Providers](/runtime/models) — Compare all providers
