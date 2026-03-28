---
title: PumpFun Streaming
sidebarTitle: PumpFun
description: Stream your agent to PumpFun using @elizaos/plugin-pumpfun-streaming.
---

Stream your agent's output to PumpFun via RTMP.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-pumpfun-streaming` |
| Config key | `streaming.pumpfun` |
| Auto-enable trigger | Both `streamKey` and `rtmpUrl` are set |

## Configuration

```json
{
  "streaming": {
    "pumpfun": {
      "streamKey": "your-stream-key",
      "rtmpUrl": "rtmp://pumpfun-ingest.example.com/live"
    }
  }
}
```

Both `streamKey` and `rtmpUrl` are required for auto-enable.

## Disabling

```json
{
  "streaming": {
    "pumpfun": {
      "enabled": false
    }
  }
}
```
