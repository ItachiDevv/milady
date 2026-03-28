---
title: LINE Connector
sidebarTitle: LINE
description: Connect your agent to LINE using the @elizaos/plugin-line package.
---

Connect your agent to LINE for bot messaging and customer conversations.

## Overview

The LINE connector is an elizaOS plugin that bridges your agent to the LINE messaging platform via the LINE Messaging API. It supports direct messages, group chats, rich message types, and webhook-based event handling. This connector is available from the plugin registry.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-line` |
| Config key | `connectors.line` |
| Availability | Registry (install required) |
| Install | `milady plugins install line` |

## Setup Requirements

1. A [LINE Developers](https://developers.line.biz/) account
2. A Messaging API channel (create one in the LINE Developers Console)
3. Channel Access Token and Channel Secret from the channel settings
4. A publicly accessible URL for the webhook endpoint (or use ngrok for development)

## Configuration

### Minimal

```json
{
  "connectors": {
    "line": {
      "enabled": true
    }
  },
  "env": {
    "LINE_CHANNEL_ACCESS_TOKEN": "your_channel_access_token",
    "LINE_CHANNEL_SECRET": "your_channel_secret"
  }
}
```

### Full Reference

```json
{
  "connectors": {
    "line": {
      "enabled": true
    }
  },
  "env": {
    "LINE_CHANNEL_ACCESS_TOKEN": "your_channel_access_token",
    "LINE_CHANNEL_SECRET": "your_channel_secret",
    "LINE_WEBHOOK_PATH": "/line/webhook",
    "LINE_DM_POLICY": "allow",
    "LINE_GROUP_POLICY": "allow",
    "LINE_ALLOW_FROM": "U1234567890abcdef,U0987654321fedcba"
  }
}
```

## Environment Variables

| Variable | Required | Sensitive | Description |
|----------|----------|-----------|-------------|
| `LINE_CHANNEL_ACCESS_TOKEN` | Yes | Yes | Channel access token from LINE Developers Console |
| `LINE_CHANNEL_SECRET` | No | Yes | Channel secret for webhook signature verification |
| `LINE_WEBHOOK_PATH` | No | No | Custom path for the webhook endpoint |
| `LINE_DM_POLICY` | No | No | DM policy: `allow`, `deny`, or `allowlist` |
| `LINE_GROUP_POLICY` | No | No | Group message policy: `allow` or `deny` |
| `LINE_ALLOW_FROM` | No | No | Comma-separated list of allowed LINE user IDs |
| `LINE_ENABLED` | No | No | Explicitly enable or disable the connector |

## Features

- **Bot messaging** — respond to direct messages from LINE users
- **Group chat** — participate in LINE group conversations
- **Rich message types** — support for text, sticker, image, and video messages
- **Webhook events** — real-time message handling via LINE webhook
- **DM and group policies** — control who the agent responds to
- **User allowlist** — restrict interactions to specific LINE user IDs

## Webhook Setup

In the LINE Developers Console:

1. Go to your channel's **Messaging API** settings
2. Set the **Webhook URL** to `https://your-domain.com/line/webhook` (or your custom path)
3. Enable **Use webhook**
4. Disable **Auto-reply messages** (so the agent handles responses)

## Related

- [Connectors overview](/guides/connectors#line)
- [Plugin registry entry](/plugin-registry/platform/line)
- [Configuration reference](/configuration)
