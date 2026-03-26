---
title: "Google Antigravity Plugin"
sidebarTitle: "Google Antigravity"
description: "Google Antigravity model provider for Milady — Google Cloud AI Platform inference."
---

The Google Antigravity plugin connects Milady agents to Google Cloud AI Platform, providing access to Google's cloud-hosted models through the Antigravity service.

**Package:** `@elizaos/plugin-google-antigravity`

## Installation

```bash
milady plugins install google-antigravity
```

## Auto-Enable

The plugin auto-enables when `GOOGLE_CLOUD_API_KEY` is present:

```bash
export GOOGLE_CLOUD_API_KEY=your-key-here
```

## Configuration

| Environment Variable | Required | Description |
|---------------------|----------|-------------|
| `GOOGLE_CLOUD_API_KEY` | Yes | Google Cloud API key |

### milady.json Example

```json
{
  "auth": {
    "profiles": {
      "default": {
        "provider": "google-antigravity"
      }
    }
  }
}
```

## Features

- Google Cloud AI Platform integration
- Streaming responses
- Tool use / function calling

## Related

- [Google Gemini Plugin](/plugin-registry/llm/google-genai) — Google Gemini models via AI Studio
- [Model Providers](/runtime/models) — Compare all providers
