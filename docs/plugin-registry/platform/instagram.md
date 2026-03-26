---
title: "Instagram Plugin"
sidebarTitle: "Instagram"
description: "Instagram connector for Milady — post media, monitor comments, and handle DMs."
---

The Instagram plugin connects Milady agents to Instagram, enabling media posting with caption generation, comment monitoring, and direct message handling.

**Package:** `@elizaos/plugin-instagram`

## Installation

```bash
milady plugins install instagram
```

## Setup

### 1. Get Your Instagram Credentials

1. Use your Instagram account username and password
2. For automation, create a dedicated account — Instagram may block automated access on personal accounts
3. If 2FA is enabled, you will need a verification code on startup

### 2. Configure Milady

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

## Configuration

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `username` | string | Yes | — | Instagram account username |
| `password` | string | Yes | — | Instagram account password |
| `verificationCode` | string | No | — | 2FA code (required if 2FA is enabled) |
| `proxy` | string | No | — | Proxy URL to reduce rate limiting and bans |
| `enabled` | boolean | No | `true` | Enable/disable the connector |

## Environment Variables

```bash
export INSTAGRAM_USERNAME=YOUR_USERNAME
export INSTAGRAM_PASSWORD=YOUR_PASSWORD
# Optional
export INSTAGRAM_VERIFICATION_CODE=123456
export INSTAGRAM_PROXY=http://proxy.example.com:8080
```

## Tips

- **Use a dedicated account** — Instagram may suspend accounts with automated behavior
- **Use a proxy** — `INSTAGRAM_PROXY` significantly reduces the risk of rate limiting and IP bans
- **2FA users** — Supply `INSTAGRAM_VERIFICATION_CODE` on startup; the code is consumed once

## Related

- [Instagram connector reference](/connectors/instagram) — Full configuration details
- [Connectors Guide](/guides/connectors) — General connector documentation
