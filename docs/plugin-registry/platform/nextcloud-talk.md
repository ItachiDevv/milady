---
title: "Nextcloud Talk Plugin"
sidebarTitle: "Nextcloud Talk"
description: "Nextcloud Talk connector for Milady — bot integration with self-hosted Nextcloud Talk chat."
---

The Nextcloud Talk plugin connects Milady agents to Nextcloud Talk, enabling message handling in Nextcloud Talk conversations on self-hosted instances.

**Package:** `@elizaos/plugin-nextcloud-talk`

## Installation

```bash
milady plugins install nextcloud-talk
```

## Setup

### 1. Prepare Your Nextcloud Instance

1. Ensure Nextcloud Talk is installed and enabled on your Nextcloud instance
2. Create a dedicated bot user or use an existing account for the agent
3. Note the Nextcloud server URL (e.g., `https://cloud.example.com`)
4. Generate an app password for the bot user under **Settings > Security > Devices & sessions**

### 2. Configure Milady

Add the connector block to your `milady.json`:

```json
{
  "connectors": {
    "nextcloud-talk": {
      "enabled": true
    }
  }
}
```

This connector is available from the elizaOS plugin registry and is not part of the default auto-enable connector set. Install it explicitly with `milady plugins install nextcloud-talk`.

## Configuration

| Field | Required | Description |
|-------|----------|-------------|
| `connectors.nextcloud-talk` | Yes | Config block for Nextcloud Talk |
| `enabled` | No | Set `false` to disable (default: `true`) |

## Features

- Room-based messaging (DM and group conversations)
- Self-hosted collaboration platform integration
- Works with any Nextcloud instance running the Talk app

## Related

- [Connectors Guide](/guides/connectors) — General connector documentation
- [Connectors Overview](/guides/connectors#nextcloud-talk)
