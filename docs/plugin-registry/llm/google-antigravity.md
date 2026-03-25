---
title: "Google Antigravity Plugin"
sidebarTitle: "Google Antigravity"
description: "Google Cloud model provider for Milady — access Google Cloud AI models."
---

The Google Antigravity plugin connects Milady agents to Google Cloud AI models, providing an alternative to the Google GenAI plugin for users with Google Cloud API keys.

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
| `GOOGLE_CLOUD_API_KEY` | Yes | Google Cloud API key from [Google Cloud Console](https://console.cloud.google.com) |

### milady.json Example

```json
{
  "env": {
    "GOOGLE_CLOUD_API_KEY": "your-google-cloud-api-key"
  }
}
```

## Difference from Google GenAI

| Plugin | Env Variable | Use Case |
|--------|-------------|----------|
| `plugin-google-genai` | `GOOGLE_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI Studio (Gemini API) |
| `plugin-google-antigravity` | `GOOGLE_CLOUD_API_KEY` | Google Cloud Platform AI APIs |

Use **Google GenAI** if you have a Gemini API key from [ai.google.dev](https://ai.google.dev). Use **Google Antigravity** if you have a Google Cloud API key from [cloud.google.com](https://cloud.google.com).

## Related

- [Google GenAI Plugin](/plugin-registry/llm/google-genai) -- Gemini models via AI Studio
- [Model Providers](/runtime/models) -- Compare all providers
