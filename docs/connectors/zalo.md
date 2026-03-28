---
title: Zalo Connector
sidebarTitle: Zalo
description: Connect your agent to Zalo using the @elizaos/plugin-zalo package.
---

Connect your agent to Zalo for Official Account messaging and support workflows.

## Overview

The Zalo connector is an elizaOS plugin that bridges your agent to Zalo, Vietnam's leading messaging platform. It connects via the Zalo Official Account (OA) API for business messaging and customer interactions. The plugin supports both webhook and polling modes for receiving messages. A personal-account variant is also available as `@elizaos/plugin-zalouser`. This connector is available from the plugin registry.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-zalo` |
| Config key | `connectors.zalo` |
| Availability | Registry (install required) |
| Install | `milady plugins install zalo` |

## Setup Requirements

1. A [Zalo Official Account](https://oa.zalo.me/) (OA)
2. App credentials from the Zalo Developer portal (App ID, Secret Key)
3. Access Token and optionally a Refresh Token for token renewal

## Configuration

### Minimal

```json
{
  "connectors": {
    "zalo": {
      "enabled": true
    }
  },
  "env": {
    "ZALO_SECRET_KEY": "your_secret_key",
    "ZALO_ACCESS_TOKEN": "your_access_token"
  }
}
```

### Full Reference

```json
{
  "connectors": {
    "zalo": {
      "enabled": true
    }
  },
  "env": {
    "ZALO_APP_ID": "your_app_id",
    "ZALO_SECRET_KEY": "your_secret_key",
    "ZALO_ACCESS_TOKEN": "your_access_token",
    "ZALO_REFRESH_TOKEN": "your_refresh_token",
    "ZALO_WEBHOOK_URL": "https://your-domain.com/zalo/webhook",
    "ZALO_WEBHOOK_PATH": "/zalo/webhook",
    "ZALO_WEBHOOK_PORT": "3300",
    "ZALO_USE_POLLING": "false",
    "ZALO_PROXY_URL": "https://proxy.example.com"
  }
}
```

## Environment Variables

| Variable | Required | Sensitive | Description |
|----------|----------|-----------|-------------|
| `ZALO_SECRET_KEY` | Yes | Yes | Zalo app secret key |
| `ZALO_ACCESS_TOKEN` | Yes | Yes | Zalo OA access token |
| `ZALO_APP_ID` | No | No | Zalo application ID |
| `ZALO_REFRESH_TOKEN` | No | Yes | Refresh token for automatic token renewal |
| `ZALO_WEBHOOK_URL` | No | No | Public URL for receiving inbound messages |
| `ZALO_WEBHOOK_PATH` | No | No | Custom path for the webhook endpoint |
| `ZALO_WEBHOOK_PORT` | No | No | Port for the webhook listener |
| `ZALO_USE_POLLING` | No | No | Use polling instead of webhooks (`true`/`false`) |
| `ZALO_ENABLED` | No | No | Explicitly enable or disable the connector |
| `ZALO_PROXY_URL` | No | No | Proxy URL for API requests |

## Features

- **Official Account messaging** — respond to customers through your Zalo OA
- **Webhook and polling modes** — choose between real-time webhooks or polling for message retrieval
- **Token auto-renewal** — automatic access token refresh when a refresh token is provided
- **Proxy support** — route API requests through a proxy when needed
- **Customer interaction management** — handle inbound customer messages and support workflows

## Related

- [Connectors overview](/guides/connectors#zalo)
- [Plugin registry entry](/plugin-registry/platform/zalo)
- [Configuration reference](/configuration)
