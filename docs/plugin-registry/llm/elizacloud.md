---
title: "elizaOS Cloud Plugin"
sidebarTitle: "elizaOS Cloud"
description: "elizaOS Cloud model provider for Milady — managed cloud inference with no local GPU required."
---

The elizaOS Cloud plugin connects Milady agents to the elizaOS managed cloud inference service, providing access to hosted models without needing local GPU hardware or individual provider API keys.

**Package:** `@elizaos/plugin-elizacloud`

## Installation

The plugin is **bundled** with every Milady installation. No manual install required.

## Auto-Enable

The plugin auto-enables when `ELIZAOS_CLOUD_API_KEY` is present or `ELIZAOS_CLOUD_ENABLED` is set to `1`:

```bash
export ELIZAOS_CLOUD_API_KEY=your-cloud-key
```

Or enable via config:

```bash
export ELIZAOS_CLOUD_ENABLED=1
```

## Configuration

| Environment Variable | Required | Description |
|---------------------|----------|-------------|
| `ELIZAOS_CLOUD_API_KEY` | Yes* | API key for elizaOS Cloud |
| `ELIZAOS_CLOUD_ENABLED` | Yes* | Set to `1` to enable (requires API key) |
| `ELIZAOS_CLOUD_BASE_URL` | No | Override the cloud endpoint URL (auto-set from config) |
| `ELIZAOS_CLOUD_SMALL_MODEL` | No | Override the small model used on cloud |
| `ELIZAOS_CLOUD_LARGE_MODEL` | No | Override the large model used on cloud |

*Either `ELIZAOS_CLOUD_API_KEY` or `ELIZAOS_CLOUD_ENABLED=1` is required.

### milady.json Example

```json
{
  "auth": {
    "profiles": {
      "default": {
        "provider": "elizacloud"
      }
    }
  }
}
```

## Features

- **Managed inference** — No local GPU or individual provider API keys needed
- **Model routing** — Automatically selects appropriate models for small/large tasks
- **Bundled** — Ships with every Milady installation, no manual plugin install

## Related

- [Model Providers](/model-providers) — All supported providers
- [Configuration](/configuration) — Config file reference
