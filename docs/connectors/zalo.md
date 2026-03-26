---
title: Zalo Connector
sidebarTitle: Zalo
description: Connect your agent to Zalo using the @elizaos/plugin-zalo package.
---

Connect your agent to Zalo for Official Account messaging and support workflows.

## Overview

The Zalo connector is an elizaOS plugin that bridges your agent to the Zalo platform via the Official Account API. This connector is available from the plugin registry. A personal-account variant is also available as `@elizaos/plugin-zalouser`.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-zalo` |
| Config key | `connectors.zalo` |
| Install | `milady plugins install zalo` |
| Auto-enable trigger | `ZALO_ACCESS_TOKEN` is set |

## Setup Requirements

- Zalo Official Account (OA) with access token and secret key

## Minimal Configuration

```bash
export ZALO_ACCESS_TOKEN=your-access-token
export ZALO_SECRET_KEY=your-secret-key
```

```json
{
  "connectors": {
    "zalo": {
      "enabled": true
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ZALO_ACCESS_TOKEN` | Yes | OA access token |
| `ZALO_SECRET_KEY` | Yes | Zalo secret key for authentication |
| `ZALO_APP_ID` | No | Application ID |
| `ZALO_REFRESH_TOKEN` | No | Token refresh credential |
| `ZALO_WEBHOOK_URL` | No | Webhook URL for receiving messages |
| `ZALO_WEBHOOK_PATH` | No | Webhook path |
| `ZALO_WEBHOOK_PORT` | No | Webhook port number |
| `ZALO_USE_POLLING` | No | Set to `true` to use polling instead of webhooks |
| `ZALO_ENABLED` | No | Explicitly enable/disable the connector |
| `ZALO_PROXY_URL` | No | Proxy URL |

## Features

- Official Account messaging and support workflows
- Webhook-based message handling
- Polling mode as alternative to webhooks
- Proxy support
- Customer interaction management

## Related

- [Connectors overview](/guides/connectors#zalo)
- [Plugin setup guide](/plugin-setup-guide#zalo-vietnam-messaging)
