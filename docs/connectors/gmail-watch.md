---
title: Gmail Watch Connector
sidebarTitle: Gmail Watch
description: Monitor Gmail inboxes using the @elizaos/plugin-gmail-watch package.
---

Monitor Gmail inboxes for incoming messages using Pub/Sub.

## Overview

The Gmail Watch connector is an elizaOS plugin that monitors Gmail inboxes via Google Cloud Pub/Sub. It watches for new messages and triggers agent events. This connector is enabled via feature flags rather than the `connectors` section. Available from the plugin registry.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-gmail-watch` |
| Feature flag | `features.gmailWatch` |
| Hooks trigger | `hooks.gmail.account` (truthy) |
| Install | `milady plugins install gmail-watch` |

## Setup Requirements

- Google Cloud service account or OAuth credentials with Gmail API access
- Pub/Sub topic configured for Gmail push notifications

## Configuration

Gmail Watch can be enabled in two ways:

### Via feature flag

```json
{
  "features": {
    "gmailWatch": true
  }
}
```

### Via hooks config

When a Gmail account is configured in the `hooks` section, the plugin is auto-enabled:

```json
{
  "hooks": {
    "gmail": {
      "account": "you@gmail.com"
    }
  }
}
```

## Features

- Gmail Pub/Sub message watching
- Auto-renewal of watch subscriptions
- Inbound email event handling

## Related

- [Connectors overview](/guides/connectors#gmail-watch)
