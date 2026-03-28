---
title: YouTube Streaming
sidebarTitle: YouTube Streaming
description: Stream your agent to YouTube using @elizaos/plugin-youtube-streaming.
---

Stream your agent's output to YouTube Live via RTMP.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-youtube-streaming` |
| Config key | `streaming.youtube` |
| Auto-enable trigger | `streamKey` is set or `enabled` is `true` |

## Configuration

```json
{
  "streaming": {
    "youtube": {
      "streamKey": "xxxx-xxxx-xxxx-xxxx-xxxx"
    }
  }
}
```

## Disabling

```json
{
  "streaming": {
    "youtube": {
      "enabled": false
    }
  }
}
```
