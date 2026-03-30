---
title: Gmail Watch
sidebarTitle: Gmail Watch
description: Monitor Gmail inboxes using the @elizaos/plugin-gmail-watch package.
---

Monitor Gmail inboxes for incoming messages using Pub/Sub.

## Overview

Gmail Watch is an elizaOS **hook plugin** (not a connector) that monitors Gmail inboxes via Google Cloud Pub/Sub. It watches for new messages and triggers agent events. It is enabled via feature flags rather than the `connectors` section.

<Info>
This plugin is **not bundled** with Milady. It is an elizaOS registry plugin that must be installed manually (`milady plugins install gmail-watch`) before use. Unlike the 19 auto-enabled connectors, Gmail Watch is a hook-based feature plugin enabled via `features.gmailWatch` in config.
</Info>

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-gmail-watch` |
| Feature flag | `features.gmailWatch` |
| Install | `milady plugins install gmail-watch` |

## Setup Requirements

- Google Cloud service account or OAuth credentials with Gmail API access
- Pub/Sub topic configured for Gmail push notifications

## Configuration

Gmail Watch is enabled via the `features` section:

```json
{
  "features": {
    "gmailWatch": true
  }
}
```

## Features

- Gmail Pub/Sub message watching
- Auto-renewal of watch subscriptions
- Inbound email event handling

## Related

- [Connectors overview](/guides/connectors#gmail-watch)
