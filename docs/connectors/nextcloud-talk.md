---
title: Nextcloud Talk Connector
sidebarTitle: Nextcloud Talk
description: Connect your agent to Nextcloud Talk using the @elizaos/plugin-nextcloud-talk package.
---

Connect your agent to Nextcloud Talk for self-hosted team messaging and collaboration.

## Overview

The Nextcloud Talk connector is an elizaOS plugin that bridges your agent to a Nextcloud Talk instance. It supports room-based messaging, DM conversations, and group chat participation on your self-hosted Nextcloud server. This connector is available from the plugin registry.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-nextcloud-talk` |
| Config key | `connectors.nextcloud-talk` |
| Availability | Registry (install required) |
| Install | `milady plugins install nextcloud-talk` |

## Setup Requirements

1. A Nextcloud server with the Talk app enabled
2. A bot user account on the Nextcloud instance (or a bot secret from Nextcloud Talk settings)
3. A publicly accessible URL for webhook delivery (or use ngrok for development)

## Configuration

### Minimal

```json
{
  "connectors": {
    "nextcloud-talk": {
      "enabled": true
    }
  },
  "env": {
    "NEXTCLOUD_URL": "https://your-nextcloud.example.com",
    "NEXTCLOUD_BOT_SECRET": "your_bot_secret"
  }
}
```

### Full Reference

```json
{
  "connectors": {
    "nextcloud-talk": {
      "enabled": true
    }
  },
  "env": {
    "NEXTCLOUD_URL": "https://your-nextcloud.example.com",
    "NEXTCLOUD_BOT_SECRET": "your_bot_secret",
    "NEXTCLOUD_WEBHOOK_PORT": "3200",
    "NEXTCLOUD_WEBHOOK_HOST": "0.0.0.0",
    "NEXTCLOUD_WEBHOOK_PATH": "/nextcloud/webhook",
    "NEXTCLOUD_WEBHOOK_PUBLIC_URL": "https://your-domain.com/nextcloud/webhook",
    "NEXTCLOUD_ALLOWED_ROOMS": "general,support,dev-chat"
  }
}
```

## Environment Variables

| Variable | Required | Sensitive | Description |
|----------|----------|-----------|-------------|
| `NEXTCLOUD_URL` | Yes | No | URL of your Nextcloud instance |
| `NEXTCLOUD_BOT_SECRET` | Yes | Yes | Bot secret for authentication |
| `NEXTCLOUD_ENABLED` | No | No | Explicitly enable or disable the connector |
| `NEXTCLOUD_WEBHOOK_PORT` | No | No | Port for the webhook listener |
| `NEXTCLOUD_WEBHOOK_HOST` | No | No | Host address for the webhook listener |
| `NEXTCLOUD_WEBHOOK_PATH` | No | No | URL path for the webhook endpoint |
| `NEXTCLOUD_WEBHOOK_PUBLIC_URL` | No | No | Public-facing URL for webhook callbacks |
| `NEXTCLOUD_ALLOWED_ROOMS` | No | No | Comma-separated list of rooms to participate in |

## Features

- **Room-based messaging** — participate in Nextcloud Talk conversations
- **DM and group support** — handle both 1:1 and group conversations
- **Self-hosted** — works with your own Nextcloud instance, no third-party dependency
- **Room filtering** — restrict the agent to specific rooms via allowlist
- **Webhook-based** — real-time message delivery via webhook integration

## Related

- [Connectors overview](/guides/connectors#nextcloud-talk)
- [Plugin registry entry](/plugin-registry/platform/nextcloud-talk)
- [Configuration reference](/configuration)
