---
title: CUA (Claude User Agent) Plugin
sidebarTitle: CUA
description: Computer-use agent capabilities using @elizaos/plugin-cua.
---

Enable Claude's computer-use capabilities for your agent, allowing it to interact with desktop applications via screenshots and mouse/keyboard actions.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-cua` |
| Feature flag | `features.cua` |
| Env auto-enable | `CUA_API_KEY` or `CUA_HOST` |

## Configuration

Enable via feature flag:

```json
{
  "features": {
    "cua": true
  }
}
```

Or via environment variables:

```bash
CUA_API_KEY=your-key
CUA_HOST=http://localhost:8080   # optional, custom CUA host
```

## Related

- [Computer Use plugin](/plugin-registry/computeruse) -- alternative computer-use integration
