---
title: Custom RTMP Streaming
sidebarTitle: Custom RTMP
description: Stream your agent to any RTMP destination.
---

Stream your agent's output to any custom RTMP endpoint. No platform API or chat bridging required.

## Package Info

| Field | Value |
|-------|-------|
| Package | Internal (bundled) |
| Config key | `streaming.customRtmp` |
| Auto-enable trigger | Both `rtmpUrl` and `rtmpKey` are set |

## Configuration

```json
{
  "streaming": {
    "customRtmp": {
      "rtmpUrl": "rtmp://your-server.example.com/live",
      "rtmpKey": "your-stream-key"
    }
  }
}
```

Both `rtmpUrl` and `rtmpKey` are required for auto-enable.

## Disabling

```json
{
  "streaming": {
    "customRtmp": {
      "enabled": false
    }
  }
}
```
