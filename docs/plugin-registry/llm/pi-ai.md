---
title: "Pi AI Plugin"
sidebarTitle: "Pi AI"
description: "Pi AI provider for Milady — use Pi's conversational models with credential-based authentication."
---

The Pi AI plugin connects Milady agents to Pi AI's models using credential-based authentication. Unlike most providers, Pi AI uses stored credentials from `~/.pi/agent/auth.json` rather than a simple API key.

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

Pi AI uses credential-based authentication. Credentials are read from `~/.pi/agent/auth.json` (API keys or OAuth tokens).

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

- Credential-based authentication (no API key needed)
- Supports primary model override via config

## Related

- [Anthropic Plugin](/plugin-registry/llm/anthropic) — Alternative cloud provider
- [Model Providers](/runtime/models) — Compare all providers
