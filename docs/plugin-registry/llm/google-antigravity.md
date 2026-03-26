---
title: "Google Antigravity Plugin"
sidebarTitle: "Google Antigravity"
description: "Google Cloud AI provider for Milady — access Google Cloud-hosted models via the Antigravity plugin."
---

The Google Antigravity plugin connects Milady agents to Google Cloud AI services, providing access to Google's cloud-hosted models as an alternative to the standard Google Generative AI (Gemini) plugin.

**Package:** `@elizaos/plugin-google-antigravity`

## Installation

```bash
milady plugins install google-antigravity
```

## Auto-Enable

The plugin auto-enables when `GOOGLE_CLOUD_API_KEY` is present:

```bash
export GOOGLE_CLOUD_API_KEY=your-google-cloud-api-key
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

## Related

- [Google Gemini Plugin](/plugin-registry/llm/google-genai) — Standard Google Generative AI provider
- [Model Providers](/runtime/models) — Compare all providers
