---
title: "elizaOS Cloud Plugin"
sidebarTitle: "elizaOS Cloud"
description: "elizaOS Cloud managed inference for Milady — no local GPU needed, multi-model routing through the Eliza Cloud API."
---

The elizaOS Cloud plugin connects Milady agents to Eliza Cloud's managed inference service, providing access to multiple AI models without requiring local GPU resources or individual provider API keys.

**Package:** `@elizaos/plugin-elizacloud`

## Installation

```bash
milady plugins install elizacloud
```

## Auto-Enable

The plugin auto-enables when either of the following environment variables is set:

```bash
export ELIZAOS_CLOUD_API_KEY=eliza_xxx
# or
export ELIZAOS_CLOUD_ENABLED=true
```

## Configuration

| Environment Variable | Required | Description |
|---------------------|----------|-------------|
| `ELIZAOS_CLOUD_API_KEY` | Yes* | Eliza Cloud API key (obtained via the cloud login flow) |
| `ELIZAOS_CLOUD_ENABLED` | Yes* | Set to `true` to enable cloud mode without a pre-existing key |

*Either `ELIZAOS_CLOUD_API_KEY` or `ELIZAOS_CLOUD_ENABLED` is required.

### milady.json Example

```json
{
  "env": {
    "ELIZAOS_CLOUD_API_KEY": "eliza_xxx"
  }
}
```

Or configure via the cloud section:

```json
{
  "cloud": {
    "enabled": true
  }
}
```

## How It Works

When elizaOS Cloud is active, the cloud plugin handles model inference calls on the server side. This means:

- **No local GPU required** -- all inference runs on Eliza Cloud infrastructure
- **No individual provider API keys** -- the cloud API key covers all model access
- **Provider plugins are removed** -- when cloud mode is active, direct AI provider plugins (Anthropic, OpenAI, etc.) are automatically excluded from the plugin list to avoid conflicts
- **Embedding priority** -- the local embedding plugin (`@elizaos/plugin-local-embedding`) is pre-registered with higher priority (10) so it handles `TEXT_EMBEDDING` calls locally, preventing unnecessary paid API calls through the cloud for embeddings

## Cloud Login Flow

The easiest way to obtain an API key is through the dashboard login flow:

1. Start Milady and open the dashboard
2. Navigate to Settings > Cloud
3. Click "Connect to Eliza Cloud" -- this opens a browser window for authentication
4. After authenticating, the API key is automatically saved to `milady.json`

Or use the API directly:

```bash
# Start login
curl -X POST http://localhost:2138/api/cloud/login

# Poll for completion
curl "http://localhost:2138/api/cloud/login/status?sessionId=SESSION_ID"
```

See the [Eliza Cloud guide](/guides/cloud) for the full walkthrough.

## Features

- Managed inference -- no GPU or provider keys needed
- Multi-model routing through a single API key
- Credit-based billing via the Eliza Cloud dashboard
- Automatic backup scheduling to the cloud
- Connection monitoring with exponential backoff reconnection
- Cloud proxy for routing chat and runtime operations through remote sandboxes

## Cloud Status

Check your cloud connection and credit balance:

```bash
curl http://localhost:2138/api/cloud/status
```

## Bundled

This plugin ships with every Milady installation and auto-enables when configured.

## Related

- [Eliza Cloud Guide](/guides/cloud) -- Full cloud integration walkthrough
- [Deployment Guide](/deployment) -- Docker and cloud deployment options
- [Model Providers](/model-providers) -- Compare all providers
