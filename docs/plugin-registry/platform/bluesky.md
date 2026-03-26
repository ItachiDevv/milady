---
title: "Bluesky Plugin"
sidebarTitle: "Bluesky"
description: "Bluesky connector for Milady — post, reply, and interact on the AT Protocol network."
---

The Bluesky plugin connects Milady agents to the Bluesky social network via the AT Protocol, enabling posting, replying, DM handling, and social interactions.

**Package:** `@elizaos/plugin-bluesky`

## Installation

```bash
milady plugins install bluesky
```

## Setup

### 1. Get Your Bluesky Credentials

1. Go to [bsky.app](https://bsky.app) and create an account (or use an existing one)
2. Note your handle (e.g., `yourname.bsky.social`)
3. Generate an app password at [Settings → App Passwords](https://bsky.app/settings/app-passwords)

> Never use your main login password. Always generate an app password.

### 2. Configure Milady

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

## Configuration

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `handle` | string | Yes | — | Bluesky handle (e.g., `yourname.bsky.social`) |
| `password` | string | Yes | — | App password |
| `enabled` | boolean | No | `true` | Enable/disable the connector |
| `enablePosting` | boolean | No | `true` | Enable automated posting |
| `postIntervalMin` | integer | No | `1800` | Minimum seconds between posts |
| `postIntervalMax` | integer | No | `3600` | Maximum seconds between posts |
| `maxPostLength` | integer | No | `300` | Maximum characters per post |
| `pollInterval` | integer | No | `60` | Seconds between polling for mentions |
| `enableDms` | boolean | No | `false` | Respond to direct messages |
| `dryRun` | boolean | No | `false` | Generate posts without publishing |
| `service` | string | No | `https://bsky.social` | PDS endpoint |

## Environment Variables

```bash
export BLUESKY_HANDLE=yourname.bsky.social
export BLUESKY_PASSWORD=your-app-password
# Optional
export BLUESKY_ENABLED=true
export BLUESKY_DRY_RUN=false
export BLUESKY_SERVICE=https://bsky.social
export BLUESKY_ENABLE_POSTING=true
export BLUESKY_POLL_INTERVAL=60
export BLUESKY_ENABLE_DMS=false
```

## Related

- [Bluesky connector reference](/connectors/bluesky) — Full configuration details
- [Connectors Guide](/guides/connectors) — General connector documentation
