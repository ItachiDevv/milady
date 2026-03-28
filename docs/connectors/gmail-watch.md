---
title: Gmail Watch Connector
sidebarTitle: Gmail Watch
description: Monitor Gmail inboxes using the @elizaos/plugin-gmail-watch package.
---

Monitor Gmail inboxes for incoming messages and trigger automated responses.

## Overview

The Gmail Watch connector is an elizaOS plugin that monitors Gmail inboxes via Google Cloud Pub/Sub. When a new email arrives, the plugin triggers your agent to process and respond. The watch subscription auto-renews so the agent stays connected without manual intervention.

Unlike most connectors, Gmail Watch is enabled via the `features` config block rather than `connectors`.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-gmail-watch` |
| Config key | `features.gmailWatch` |
| Availability | Registry (install required) |
| Install | `milady plugins install gmail-watch` |

## Setup Requirements

1. A Google Cloud project with the Gmail API enabled
2. A Pub/Sub topic and subscription configured for Gmail push notifications
3. OAuth credentials or a service account with Gmail API access
4. The Gmail account must grant the application read access

## Configuration

### Enable via Features

```json
{
  "features": {
    "gmailWatch": true
  }
}
```

Or via the hooks config:

```json
{
  "hooks": {
    "gmail": {
      "account": "you@gmail.com"
    }
  }
}
```

## Google Cloud Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Gmail API** for your project
3. Create a **Pub/Sub topic** (e.g., `projects/my-project/topics/gmail-watch`)
4. Create a **push subscription** pointing to your agent's webhook URL
5. Grant the Gmail service account (`gmail-api-push@system.gserviceaccount.com`) publish access to the topic
6. Set up OAuth consent and create credentials (OAuth client ID or service account key)

## Features

- **Pub/Sub message watching** — real-time email notifications via Google Cloud Pub/Sub
- **Auto-renewal** — watch subscription is automatically renewed before expiration
- **Inbound email processing** — trigger agent actions when new emails arrive
- **Automated responses** — let the agent compose and send email replies

## Related

- [Connectors overview](/guides/connectors#gmail-watch)
- [Plugin registry entry](/plugin-registry/platform/gmail-watch)
- [Configuration reference](/configuration)
