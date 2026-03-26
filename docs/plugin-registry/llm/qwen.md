---
title: "Qwen Plugin"
sidebarTitle: "Qwen"
description: "Qwen model provider for Milady — Alibaba Cloud's Qwen language models."
---

The Qwen plugin connects Milady agents to Alibaba Cloud's Qwen family of language models, offering strong multilingual capabilities with particular strength in Chinese and English.

**Package:** `@elizaos/plugin-qwen`

## Installation

```bash
milady plugins install qwen
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
        "provider": "qwen"
      }
    }
  }
}
```

## Features

- Multilingual support (strong in Chinese and English)
- Streaming responses
- Tool use / function calling
- Code generation
- Long context windows

## Related

- [DeepSeek Plugin](/plugin-registry/llm/deepseek) — Alternative Chinese AI provider
- [Ollama Plugin](/plugin-registry/llm/ollama) — Run Qwen models locally via Ollama
- [Model Providers](/runtime/models) — Compare all providers
