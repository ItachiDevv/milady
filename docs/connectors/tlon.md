---
title: Tlon Connector
sidebarTitle: Tlon
description: Connect your agent to Tlon/Urbit using the @elizaos/plugin-tlon package.
---

Connect your agent to the Urbit network via Tlon for ship-to-ship messaging and group chat.

## Overview

The Tlon connector is an elizaOS plugin that bridges your agent to the Urbit network. It supports ship-to-ship direct messaging, group channel participation, and automatic channel discovery. This connector is available from the plugin registry.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-tlon` |
| Config key | `connectors.tlon` |
| Availability | Registry (install required) |
| Install | `milady plugins install tlon` |

## Setup Requirements

1. A running Urbit ship (planet, star, or comet)
2. The ship's access code (found at `+code` in the Dojo)
3. The ship's URL (e.g., `http://localhost:80` for local ships)

## Configuration

### Minimal

```json
{
  "connectors": {
    "tlon": {
      "enabled": true
    }
  },
  "env": {
    "TLON_SHIP": "~zod",
    "TLON_URL": "http://localhost:80",
    "TLON_CODE": "your-access-code"
  }
}
```

### Full Reference

```json
{
  "connectors": {
    "tlon": {
      "enabled": true
    }
  },
  "env": {
    "TLON_SHIP": "~zod",
    "TLON_URL": "http://localhost:80",
    "TLON_CODE": "your-access-code",
    "TLON_GROUP_CHANNELS": "~zod/my-group,~bus/dev-chat",
    "TLON_DM_ALLOWLIST": "~nus,~bus",
    "TLON_AUTO_DISCOVER_CHANNELS": "true"
  }
}
```

## Environment Variables

| Variable | Required | Sensitive | Description |
|----------|----------|-----------|-------------|
| `TLON_SHIP` | Yes | No | Urbit ship name (e.g., `~zod`) |
| `TLON_URL` | Yes | No | URL of the running ship |
| `TLON_CODE` | Yes | No | Ship access code (from `+code` in Dojo) |
| `TLON_ENABLED` | No | No | Explicitly enable or disable the connector |
| `TLON_GROUP_CHANNELS` | No | No | Comma-separated list of group channels to join |
| `TLON_DM_ALLOWLIST` | No | No | Comma-separated list of ships allowed to DM |
| `TLON_AUTO_DISCOVER_CHANNELS` | No | No | Automatically discover and join available channels |

## Features

- **Ship-to-ship messaging** — direct message conversations between Urbit ships
- **Group chat participation** — join and interact in Tlon group channels
- **DM allowlist** — control which ships can initiate direct messages
- **Auto-discovery** — automatically discover and join channels when enabled
- **Channel selection** — explicitly configure which group channels to participate in

## Related

- [Connectors overview](/guides/connectors#tlon)
- [Plugin registry entry](/plugin-registry/platform/tlon)
- [Configuration reference](/configuration)
