---
title: "Qwen Plugin"
sidebarTitle: "Qwen"
description: "Qwen model provider for Milady — access Alibaba Cloud's Qwen language models."
---

The Qwen plugin connects Milady agents to Alibaba Cloud's Qwen (Tongyi Qianwen) language models, providing access to multilingual models with strong Chinese and English capabilities.

**Package:** `@elizaos/plugin-qwen`

## Installation

```bash
milady plugins install qwen
```

## Configuration

Qwen does not have an env-var auto-enable trigger but auto-enables when configured as a provider in an auth profile:

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

- Multilingual support (strong Chinese and English)
- Streaming responses
- Tool use / function calling

## Related

- [DeepSeek Plugin](/plugin-registry/llm/deepseek) — DeepSeek models
- [OpenRouter Plugin](/plugin-registry/llm/openrouter) — Route between multiple providers
- [Model Providers](/runtime/models) — Compare all providers
