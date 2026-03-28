---
title: Twitch Streaming
sidebarTitle: Twitch Streaming
description: Stream your agent to Twitch using @elizaos/plugin-twitch-streaming.
---

Stream your agent's output to Twitch via RTMP.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-twitch-streaming` |
| Config key | `streaming.twitch` |
| Auto-enable trigger | `streamKey` is set or `enabled` is `true` |

## Configuration

```json
{
  "streaming": {
    "twitch": {
      "streamKey": "live_xxxxx"
    }
  }
}
```

## Disabling

To explicitly disable even when a stream key is present:

```json
{
  "streaming": {
    "twitch": {
      "enabled": false
    }
  }
}
```

## Related

- [Twitch Connector](/connectors/twitch) -- chat integration (separate from streaming)
