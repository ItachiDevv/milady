---
title: Shell Plugin
sidebarTitle: Shell
description: Allow your agent to execute shell commands using @elizaos/plugin-shell.
---

Let your agent execute shell commands on the host system.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-shell` |
| Feature flag | `features.shell` |
| Auto-enable | When `features.shell` is `true` in config |

## Configuration

```json
{
  "features": {
    "shell": true
  }
}
```

## Security

Shell access gives the agent full command-line capabilities on the host. Only enable this in trusted environments. The agent can execute any command that the runtime process user can run.

## Related

- [Sandbox guide](/guides/sandbox) -- running agents in sandboxed environments
