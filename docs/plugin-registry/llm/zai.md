---
title: "Zai Plugin"
sidebarTitle: "Zai"
description: "Zai model provider for Milady — Homunculus Labs inference service."
---

The Zai plugin connects Milady agents to the Zai inference service by Homunculus Labs.

**Package:** `@homunculuslabs/plugin-zai`

## Installation

```bash
milady plugins install @homunculuslabs/plugin-zai
```

## Auto-Enable

The plugin auto-enables when `ZAI_API_KEY` is present:

```bash
export ZAI_API_KEY=your-key-here
```

## Configuration

| Environment Variable | Required | Description |
|---------------------|----------|-------------|
| `ZAI_API_KEY` | Yes | Zai API key from Homunculus Labs |

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

- Homunculus Labs model inference
- Streaming responses

## Related

- [OpenAI Plugin](/plugin-registry/llm/openai) — General-purpose alternative
- [Model Providers](/runtime/models) — Compare all providers
