---
title: Zalo Connector
sidebarTitle: Zalo
description: Connect your agent to Zalo using the @elizaos/plugin-zalo package.
---

Connect your agent to Zalo for Official Account messaging and support workflows.

<Warning>
This connector is **not auto-enabled**. It must be manually installed from the elizaOS plugin registry before use. It will not activate from config or environment variables alone.
</Warning>

## Overview

The Zalo connector is an elizaOS plugin that bridges your agent to the Zalo platform via the Official Account API. This connector is available from the plugin registry and requires explicit installation. A personal-account variant is also available as `@elizaos/plugin-zalouser`.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-zalo` |
| Config key | `connectors.zalo` |
| Install | `milady plugins install zalo` |

## Setup Requirements

- Zalo Official Account (OA) access token

## Configuration

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

| Variable | Description |
|----------|-------------|
| `ZALO_ACCESS_TOKEN` | OA access token |
| `ZALO_REFRESH_TOKEN` | Token refresh credential |
| `ZALO_APP_ID` | Application ID |
| `ZALO_APP_SECRET` | Application secret |

## Features

- Official Account messaging and support workflows
- Webhook-based message handling
- Customer interaction management

## Related

- [Connectors overview](/guides/connectors#zalo)
