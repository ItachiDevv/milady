---
title: "Discord Plugin"
sidebarTitle: "Discord"
description: "Discord connector for Milady — bot integration, slash commands, voice support, and multi-server management."
---

The Discord plugin connects Milady agents to Discord as a bot, enabling message handling across servers, channels, and DMs with support for slash commands, reactions, and voice channels.

**Package:** `@elizaos/plugin-discord`

## Installation

```bash
milady plugins install discord
```

## Setup

### 1. Create a Discord Application

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Navigate to **Bot** → **Add Bot**
4. Under **Token**, click **Reset Token** and copy the token
5. Under **Privileged Gateway Intents**, enable:
   - **Server Members Intent**
   - **Message Content Intent**
   - **Presence Intent**

### 2. Invite the Bot to Your Server

1. Navigate to **OAuth2 → URL Generator**
2. Select scopes: `bot`, `applications.commands`
3. Select permissions: `Send Messages`, `Read Message History`, `Add Reactions`, `Connect` (for voice)
4. Copy the generated URL and open it to invite the bot

### 3. Configure Milady

```json
{
  "connectors": {
    "discord": {
      "token": "YOUR_BOT_TOKEN"
    }
  }
}
```

Or via environment variable:

```bash
export DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN
```

<Warning>
Use the `token` field in your config — the Discord connector schema uses strict validation and `botToken` is not a recognized field. While `botToken` triggers auto-enable detection, only `token` passes schema validation.
</Warning>

## Configuration

| Field | Required | Description |
|-------|----------|-------------|
| `token` | Yes | Discord bot token |
| `enabled` | No | Set `false` to disable (default: `true`) |
| `groupPolicy` | No | Group message policy: `"allowlist"` (default) or `"open"` |
| `guilds` | No | Per-guild configuration (channels, mention requirements) |
| `dm` | No | DM policy settings |
| `blockStreaming` | No | Disable streaming responses |

```json
{
  "connectors": {
    "discord": {
      "token": "YOUR_BOT_TOKEN",
      "groupPolicy": "allowlist",
      "guilds": {
        "SERVER_ID": {
          "requireMention": true,
          "channels": {
            "CHANNEL_ID": {
              "allow": true,
              "requireMention": false
            }
          }
        }
      },
      "dm": {
        "enabled": true,
        "policy": "pairing"
      }
    }
  }
}
```

## Features

- **Message handling** — Responds to DMs and channel messages where the bot is mentioned or addressed by name
- **Slash commands** — Registers Discord slash commands for agent actions
- **Reactions** — Can add emoji reactions to messages
- **Threads** — Participates in thread conversations
- **Voice channels** — Can join voice channels (requires additional setup)
- **Multi-server** — Operates across multiple servers simultaneously
- **Role detection** — Reads member roles for permission-based responses
- **Per-guild/channel config** — Fine-grained control over which servers and channels the bot responds in
- **Execution approvals** — Designate approver users for sensitive operations

## Message Flow

```
Discord Message
       ↓
Plugin receives MESSAGE_CREATE event
       ↓
Determines if agent should respond:
  - DM → always respond
  - Channel → respond if mentioned or addressed
       ↓
Formats as Milady Memory
       ↓
AgentRuntime processes
       ↓
Response sent back to Discord channel/DM
```

## Auto-Enable

The plugin auto-enables when the `connectors.discord` block contains a `token`:

```json
{
  "connectors": {
    "discord": {
      "token": "YOUR_BOT_TOKEN"
    }
  }
}
```

## Environment Variables

The bot token can also be set via:

```bash
export DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN
```

## Related

- [Discord Connector Guide](/connectors/discord) — Detailed connector documentation with per-guild/channel config
- [Telegram Plugin](/plugin-registry/platform/telegram) — Telegram bot integration
- [Slack Plugin](/plugin-registry/platform/slack) — Slack workspace integration
- [Connectors Guide](/guides/connectors) — General connector documentation
