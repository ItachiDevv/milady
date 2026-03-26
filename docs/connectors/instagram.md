---
title: Instagram Connector
sidebarTitle: Instagram
description: Connect your agent to Instagram using the @elizaos/plugin-instagram package.
---

Connect your agent to Instagram for media posting, comment monitoring, and DM handling.

## Overview

The Instagram connector is an elizaOS plugin that bridges your agent to Instagram. It supports media posting with caption generation, comment response, and direct message handling. This connector is available from the plugin registry.

> **Warning:** This connector uses an unofficial API. Instagram frequently blocks automated access. Use a dedicated account, not your personal one.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-instagram` |
| Config key | `connectors.instagram` |
| Install | `milady plugins install instagram` |

## Setup Requirements

- Instagram account credentials (username and password)
- A dedicated account is recommended — Instagram may block automated access on personal accounts
- If 2FA is enabled, you will need to supply a verification code on startup

## Minimal Configuration

In your character file:

```json
{
  "connectors": {
    "instagram": {
      "username": "YOUR_USERNAME",
      "password": "YOUR_PASSWORD"
    }
  }
}
```

Or via environment variables:

```bash
export INSTAGRAM_USERNAME=YOUR_USERNAME
export INSTAGRAM_PASSWORD=YOUR_PASSWORD
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `INSTAGRAM_USERNAME` | Yes | — | Instagram username |
| `INSTAGRAM_PASSWORD` | Yes | — | Instagram password |
| `INSTAGRAM_VERIFICATION_CODE` | No | — | 2FA verification code (required if 2FA is enabled) |
| `INSTAGRAM_PROXY` | No | — | Proxy URL to reduce rate limiting and bans |

## Full Configuration Reference

All fields are nested under `connectors.instagram` in your character file.

### Authentication

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | Yes | Instagram account username |
| `password` | string | Yes | Instagram account password |
| `verificationCode` | string | No | 2FA code if enabled on the account |
| `proxy` | string | No | Proxy URL (reduces bans from automated access) |
| `enabled` | boolean | No | Explicitly enable/disable the connector |

### Example: Full Configuration

```json
{
  "connectors": {
    "instagram": {
      "username": "YOUR_USERNAME",
      "password": "YOUR_PASSWORD",
      "proxy": "http://proxy.example.com:8080",
      "enabled": true
    }
  }
}
```

## Tips

- **Use a dedicated account** — Instagram may suspend accounts that show automated behavior
- **Use a proxy** — Setting `INSTAGRAM_PROXY` significantly reduces the risk of rate limiting and IP bans
- **2FA users** — Supply `INSTAGRAM_VERIFICATION_CODE` on startup; the code is consumed once during authentication

## Features

- Media posting with caption generation
- Comment monitoring and response
- DM handling
- Proxy support for rate limit mitigation

## Related

- [Instagram plugin reference](/plugin-registry/platform/instagram)
- [Connectors overview](/guides/connectors#instagram)
- [Plugin setup guide](/plugin-setup-guide#instagram)
