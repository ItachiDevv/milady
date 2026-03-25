---
title: "Pi AI Plugin"
sidebarTitle: "Pi AI"
description: "Pi AI credentials provider for Milady — use local Pi credentials from ~/.pi/agent/auth.json."
---

The Pi AI plugin connects Milady agents to model providers using credentials stored locally in the Pi agent auth file. It acts as a credential bridge, using API keys or OAuth tokens from `~/.pi/agent/auth.json`.

**Package:** `@elizaos/plugin-pi-ai`

## Auto-Enable

The plugin auto-enables when `ELIZA_USE_PI_AI` is set to a truthy value:

```bash
export ELIZA_USE_PI_AI=true
```

## Configuration

| Environment Variable | Required | Description |
|---------------------|----------|-------------|
| `ELIZA_USE_PI_AI` | Yes | Set to `true` to enable Pi AI credentials |

### Credentials File

Pi AI reads credentials from `~/.pi/agent/auth.json`. This file contains API keys or OAuth tokens for upstream providers.

### milady.json Example

```json
{
  "env": {
    "ELIZA_USE_PI_AI": "true"
  }
}
```

## Features

- Local credential management via `~/.pi/agent/auth.json`
- Supports primary model override
- Handles upstream provider selection automatically

## How It Works

When enabled, Pi AI reads credentials from the local Pi agent auth file and configures the appropriate upstream model provider. This allows you to use credentials managed by the Pi agent infrastructure without manually setting individual API keys.

## Related

- [Model Providers](/runtime/models) -- Compare all providers
- [Ollama Plugin](/plugin-registry/llm/ollama) -- Another local-first option
