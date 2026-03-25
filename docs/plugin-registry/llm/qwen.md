---
title: "Qwen Plugin"
sidebarTitle: "Qwen"
description: "Qwen model provider for Milady — Alibaba's Qwen language models."
---

The Qwen plugin connects Milady agents to Alibaba's Qwen model family, including Qwen 2.5 and other variants.

**Package:** `@elizaos/plugin-qwen`

## Installation

```bash
milady plugins install qwen
```

## Configuration

Configure via the auth profile in `milady.json`:

```json
{
  "auth": {
    "profiles": {
      "default": {
        "provider": "qwen"
      }
    }
  }
}
```

## Available Models

| Model | Description |
|-------|-------------|
| `qwen2.5:0.5b` | Lightweight, fast inference |
| `qwen2.5:7b-instruct` | Instruction-tuned, good for chat |

Qwen models can also be used locally via [Ollama](/plugin-registry/llm/ollama) by pulling them with `ollama pull qwen2.5`.

## Related

- [Ollama Plugin](/plugin-registry/llm/ollama) -- Run Qwen models locally
- [Model Providers](/runtime/models) -- Compare all providers
