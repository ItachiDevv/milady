---
title: Instagram Connector
sidebarTitle: Instagram
description: Connect your agent to Instagram using the @elizaos/plugin-instagram package.
---

Connect your agent to Instagram for media posting, comment monitoring, and DM handling.

## Overview

The Instagram connector is an elizaOS plugin that bridges your agent to Instagram. It supports media posting with AI-generated captions, comment monitoring and responses, and DM handling. The plugin authenticates using Instagram account credentials and supports proxy routing for API requests. This connector is available from the plugin registry.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-instagram` |
| Config key | `connectors.instagram` |
| Availability | Registry (install required) |
| Install | `milady plugins install instagram` |

## Setup Requirements

1. An Instagram account (username and password)
2. If 2FA is enabled, the current verification code during first login

## Configuration

### Minimal

```json
{
  "connectors": {
    "instagram": {
      "enabled": true
    }
  },
  "env": {
    "INSTAGRAM_USERNAME": "your_username",
    "INSTAGRAM_PASSWORD": "your_password"
  }
}
```

### Full Reference

```json
{
  "connectors": {
    "instagram": {
      "enabled": true
    }
  },
  "env": {
    "INSTAGRAM_USERNAME": "your_username",
    "INSTAGRAM_PASSWORD": "your_password",
    "INSTAGRAM_VERIFICATION_CODE": "123456",
    "INSTAGRAM_PROXY": "http://proxy.example.com:8080",
    "INSTAGRAM_DRY_RUN": "false",
    "INSTAGRAM_POLL_INTERVAL": "120",
    "INSTAGRAM_POST_INTERVAL_MIN": "3600",
    "INSTAGRAM_POST_INTERVAL_MAX": "14400"
  }
}
```

## Environment Variables

| Variable | Required | Sensitive | Description |
|----------|----------|-----------|-------------|
| `INSTAGRAM_USERNAME` | Yes | No | Instagram account username |
| `INSTAGRAM_PASSWORD` | Yes | Yes | Instagram account password |
| `INSTAGRAM_VERIFICATION_CODE` | No | Yes | 2FA verification code (needed on first login if 2FA is enabled) |
| `INSTAGRAM_PROXY` | No | No | Proxy URL for API requests |
| `INSTAGRAM_DRY_RUN` | No | No | When `true`, simulates posting without actually publishing |
| `INSTAGRAM_POLL_INTERVAL` | No | No | Seconds between polling for new comments/DMs |
| `INSTAGRAM_POST_INTERVAL_MIN` | No | No | Minimum seconds between automated posts |
| `INSTAGRAM_POST_INTERVAL_MAX` | No | No | Maximum seconds between automated posts |

## Features

- **Media posting** — publish photos with AI-generated captions
- **Comment monitoring** — detect and respond to comments on posts
- **DM handling** — respond to direct messages
- **Dry run mode** — test posting logic without publishing (`INSTAGRAM_DRY_RUN=true`)
- **Proxy support** — route API traffic through a proxy
- **Configurable intervals** — control polling frequency and posting cadence

## Security Notes

- Instagram credentials are stored in your local config. Never share your config file.
- Consider using a dedicated account for the agent rather than your personal account.
- Consider using a proxy to separate agent traffic from your personal IP.

## Related

- [Connectors overview](/guides/connectors#instagram)
- [Plugin registry entry](/plugin-registry/platform/instagram)
- [Configuration reference](/configuration)
