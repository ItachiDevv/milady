---
title: X (Twitter) Streaming
sidebarTitle: X Streaming
description: Stream your agent to X (Twitter) using @elizaos/plugin-x-streaming.
---

Stream your agent's output to X (Twitter) Live via RTMP.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-x-streaming` |
| Config key | `streaming.x` |
| Auto-enable trigger | Both `streamKey` and `rtmpUrl` are set |

## Configuration

```json
{
  "streaming": {
    "x": {
      "streamKey": "your-stream-key",
      "rtmpUrl": "rtmp://x-ingest.example.com/live"
    }
  }
}
```

Both `streamKey` and `rtmpUrl` are required for auto-enable.

## Disabling

```json
{
  "streaming": {
    "x": {
      "enabled": false
    }
  }
}
```
