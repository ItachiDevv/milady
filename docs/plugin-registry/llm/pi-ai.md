---
title: "Pi AI Plugin"
sidebarTitle: "Pi AI"
description: "Pi AI model provider for Milady — conversational AI by Inflection."
---

The Pi AI plugin connects Milady agents to Inflection's Pi conversational AI model.

**Package:** `@elizaos/plugin-pi-ai`

## Installation

```bash
milady plugins install pi-ai
```

## Auto-Enable

The plugin auto-enables when `ELIZA_USE_PI_AI` is set:

```bash
export ELIZA_USE_PI_AI=true
```

## Configuration

| Environment Variable | Required | Description |
|---------------------|----------|-------------|
| `ELIZA_USE_PI_AI` | Yes | Set to `true` to enable Pi AI |

### milady.json Example

```json
{
  "auth": {
    "profiles": {
      "default": {
        "provider": "pi-ai"
      }
    }
  }
}
```

## Features

- Conversational AI model by Inflection
- Streaming responses
- Natural, empathetic conversation style

## Related

- [OpenAI Plugin](/plugin-registry/llm/openai) — General-purpose alternative
- [Model Providers](/runtime/models) — Compare all providers
