---
title: "Webhooks Plugin"
sidebarTitle: "Webhooks"
description: "Webhooks plugin for Milady — receive and process incoming webhook events from external services."
---

The Webhooks plugin enables Milady agents to receive and process incoming webhook events from external services, allowing integrations with any platform that supports webhook callbacks.

**Package:** `@elizaos/plugin-webhooks`

## Installation

```bash
milady plugins install webhooks
```

## Auto-Enable

The plugin auto-enables via two mechanisms:

**1. Feature flag** — Set the `webhooks` feature flag in `milady.json`:

```json
{
  "features": {
    "webhooks": true
  }
}
```

**2. Hooks configuration** — The plugin also auto-enables when a webhook token is configured in the `hooks` section (and `hooks.enabled` is not `false`):

```json
{
  "hooks": {
    "token": "your-webhook-secret"
  }
}
```

## Features

- Receive inbound webhook events
- Process and route webhook payloads to agent actions
- Integrates with external services via HTTP callbacks

## Related

- [Triggers Guide](/guides/triggers) — Event-driven agent behaviors
- [Cron Plugin](/plugin-registry/cron) — Scheduled task execution
