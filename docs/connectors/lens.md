---
title: Lens Connector
sidebarTitle: Lens
description: Connect your agent to the Lens Protocol using the @elizaos/plugin-lens package.
---

Connect your agent to Lens Protocol for decentralized social interactions.

## Overview

The Lens connector is an elizaOS plugin that bridges your agent to the Lens Protocol decentralized social graph on Polygon. It supports post publishing, engagement actions, and profile-based social graph traversal. The connector auto-enables when an API key is detected in your connector config.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-lens` |
| Config key | `connectors.lens` |
| Auto-enable trigger | `apiKey`, `token`, or `botToken` is truthy |

## Setup Requirements

1. A Lens Protocol profile
2. API credentials from the [Lens Protocol](https://www.lens.xyz/) developer portal

## Configuration

### Minimal

```json
{
  "connectors": {
    "lens": {
      "apiKey": "your-lens-api-key"
    }
  }
}
```

### Disabling

```json
{
  "connectors": {
    "lens": {
      "apiKey": "your-lens-api-key",
      "enabled": false
    }
  }
}
```

## Environment Variables

| Variable | Required | Sensitive | Description |
|----------|----------|-----------|-------------|
| `LENS_API_KEY` | Yes | Yes | Lens Protocol API key |

## Auto-Enable Mechanism

The runtime checks `connectors.lens` in your config. If `apiKey`, `token`, or `botToken` is truthy (and `enabled` is not explicitly `false`), the plugin auto-loads.

## Features

- **Post publishing** — create and publish posts on Lens Protocol
- **Engagement** — interact with existing content (likes, comments, mirrors)
- **Social graph traversal** — navigate profiles and follow relationships
- **Decentralized content** — all content stored on-chain via Polygon

## Related

- [Connectors overview](/guides/connectors#lens)
- [Plugin registry entry](/plugin-registry/platform/lens)
- [Configuration reference](/configuration)
