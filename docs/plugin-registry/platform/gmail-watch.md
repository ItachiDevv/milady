---
title: "Gmail Watch Plugin"
sidebarTitle: "Gmail Watch"
description: "Gmail Watch connector for Milady — monitor Gmail inboxes and respond to incoming emails via Pub/Sub."
---

The Gmail Watch plugin connects Milady agents to Gmail, enabling monitoring of incoming emails and automated responses via Google Cloud Pub/Sub.

**Package:** `@elizaos/plugin-gmail-watch`

## Installation

```bash
milady plugins install gmail-watch
```

## Setup

### 1. Set Up Google Cloud

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com)
2. Enable the **Gmail API** and **Cloud Pub/Sub API**
3. Create a Pub/Sub topic for Gmail push notifications
4. Set up a service account or OAuth credentials with Gmail API access
5. Grant the Gmail service account (`gmail-api-push@system.gserviceaccount.com`) publish permissions on your Pub/Sub topic

### 2. Enable the Feature Flag

Gmail Watch is activated via the `features.gmailWatch` flag (not via the `connectors` section):

```json
{
  "features": {
    "gmailWatch": true
  }
}
```

### 3. Configure the Gmail Hook

Add Gmail account configuration to the hooks section:

```json
{
  "hooks": {
    "gmail": {
      "account": "your-email@gmail.com"
    }
  }
}
```

## Configuration

| Field | Required | Description |
|-------|----------|-------------|
| `features.gmailWatch` | Yes | Set `true` to enable the Gmail Watch plugin |
| `hooks.gmail.account` | Yes | Gmail account to monitor (triggers auto-enable) |

## Features

- Gmail Pub/Sub message watching
- Auto-renewal of watch subscriptions
- Inbound email event handling
- Automated agent responses to incoming emails

## How It Works

The plugin uses Google Cloud Pub/Sub to receive real-time notifications when new emails arrive. When a new message is detected, it triggers an agent event that can be processed by your agent's actions and evaluators.

## Related

- [Connectors Guide](/guides/connectors) — General connector documentation
- [Connectors Overview](/guides/connectors#gmail-watch)
