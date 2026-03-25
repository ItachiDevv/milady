---
title: "Minimax Plugin"
sidebarTitle: "Minimax"
description: "Minimax model provider for Milady — Minimax AI language and video models."
---

The Minimax plugin connects Milady agents to Minimax AI models for text and video generation capabilities.

**Package:** `@elizaos/plugin-minimax`

## Installation

```bash
milady plugins install minimax
```

## Configuration

Configure via the auth profile in `milady.json`:

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

- Text generation via Minimax language models
- Video generation capabilities (also available via the [FAL plugin](/plugin-registry/image-generation) as `fal-ai/minimax-video`)

## Related

- [Model Providers](/runtime/models) -- Compare all providers
- [Image Generation Plugin](/plugin-registry/image-generation) -- Media generation including video
