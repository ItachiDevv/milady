---
title: Bluesky Connector
sidebarTitle: Bluesky
description: Connect your agent to Bluesky using the @elizaos/plugin-bluesky package.
---

Connect your agent to Bluesky for social posting and engagement on the AT Protocol network.

## Overview

The Bluesky connector is an elizaOS plugin that bridges your agent to Bluesky via the AT Protocol. It supports automated posting, mention monitoring, DM handling, and reply interactions. This connector is available from the plugin registry.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-bluesky` |
| Config key | `connectors.bluesky` |
| Install | `milady plugins install bluesky` |

## Setup Requirements

- Bluesky account with a handle (e.g., `yourname.bsky.social`)
- An app password — generate one at [bsky.app/settings/app-passwords](https://bsky.app/settings/app-passwords)

> Never use your main Bluesky login password. Always use an app password.

## Minimal Configuration

In your character file:

```json
{
  "connectors": {
    "bluesky": {
      "handle": "yourname.bsky.social",
      "password": "your-app-password"
    }
  }
}
```

Or via environment variables:

```bash
export BLUESKY_HANDLE=yourname.bsky.social
export BLUESKY_PASSWORD=your-app-password
```

## Disabling

To explicitly disable the connector even when credentials are present:

```json
{
  "connectors": {
    "bluesky": {
      "handle": "yourname.bsky.social",
      "password": "your-app-password",
      "enabled": false
    }
  }
}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BLUESKY_HANDLE` | Yes | — | Your Bluesky handle (e.g., `yourname.bsky.social`) |
| `BLUESKY_PASSWORD` | Yes | — | App password (not your login password) |
| `BLUESKY_ENABLED` | No | `true` | Set to `false` to disable |
| `BLUESKY_DRY_RUN` | No | `false` | When `true`, generates posts but does not publish them |
| `BLUESKY_SERVICE` | No | `https://bsky.social` | PDS endpoint (only change for self-hosted PDS) |

## Full Configuration Reference

All fields are nested under `connectors.bluesky` in your character file.

### Authentication

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `handle` | string | Yes | Bluesky handle (e.g., `yourname.bsky.social`) |
| `password` | string | Yes | App password |
| `enabled` | boolean | No | Explicitly enable/disable the connector |

### Posting Configuration

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enablePosting` | boolean | `true` | Enable automated posting |
| `postImmediately` | boolean | `false` | Post immediately on startup (skip initial delay) |
| `postIntervalMin` | integer | `1800` | Minimum seconds between automated posts |
| `postIntervalMax` | integer | `3600` | Maximum seconds between automated posts |
| `maxPostLength` | integer | `300` | Maximum characters per post |

### Interaction Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `pollInterval` | integer | `60` | Seconds between polling for new mentions/interactions |
| `enableActionProcessing` | boolean | `true` | Process actions (like, repost, etc.) |
| `actionInterval` | integer | `120` | Seconds between action processing cycles |
| `maxActionsProcessing` | integer | `5` | Maximum actions to process per cycle |
| `enableDms` | boolean | `false` | Respond to direct messages |

### Safety and Testing

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `dryRun` | boolean | `false` | When `true`, generates posts but does not publish them |
| `service` | string | `https://bsky.social` | PDS endpoint (only change for self-hosted PDS) |

### Example: Full Configuration

```json
{
  "connectors": {
    "bluesky": {
      "handle": "yourname.bsky.social",
      "password": "your-app-password",
      "enablePosting": true,
      "postIntervalMin": 1800,
      "postIntervalMax": 3600,
      "maxPostLength": 300,
      "pollInterval": 60,
      "enableDms": true,
      "enableActionProcessing": true,
      "dryRun": false
    }
  }
}
```

## Features

- Automated post creation at configurable intervals
- Mention and reply monitoring
- Direct message handling
- Action processing (like, repost)
- Dry run mode for testing
- AT Protocol-based decentralized social networking

## Related

- [Bluesky plugin reference](/plugin-registry/platform/bluesky)
- [Connectors overview](/guides/connectors#bluesky)
- [Plugin setup guide](/plugin-setup-guide#bluesky)
