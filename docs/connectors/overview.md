---
title: Connectors Overview
sidebarTitle: Overview
description: Platform connectors bridge your agent to messaging platforms. 19 are built-in; additional connectors are installable from the registry.
---

Connectors are plugins that bridge your agent to messaging and social platforms. They auto-enable when you add credentials to the `connectors` section of your config (`milady.json`).

## Built-in Connectors (auto-enable)

These 19 connectors ship with Milady and activate automatically when configured. Add the connector's credentials to `connectors.<name>` in `milady.json` — no `milady plugins install` needed.

| Connector | Config key | Auto-enable trigger |
|-----------|-----------|-------------------|
| [Discord](/connectors/discord) | `connectors.discord` | `token` or `botToken` present |
| [Telegram](/connectors/telegram) | `connectors.telegram` | `token` or `botToken` present |
| [Twitter / X](/connectors/twitter) | `connectors.twitter` | `token` or `apiKey` present |
| [Slack](/connectors/slack) | `connectors.slack` | `token` or `botToken` present |
| [WhatsApp](/connectors/whatsapp) | `connectors.whatsapp` | `token` or `apiKey` present |
| [Signal](/connectors/signal) | `connectors.signal` | Account with `account` + `httpUrl` configured |
| [iMessage](/connectors/imessage) | `connectors.imessage` | `token` or `apiKey` present |
| [BlueBubbles](/connectors/bluebubbles) | `connectors.bluebubbles` | `token` or `apiKey` present |
| [Blooio](/connectors/blooio) | `connectors.blooio` | `token` or `apiKey` present |
| [MS Teams](/connectors/msteams) | `connectors.msteams` | `token` or `apiKey` present |
| [Google Chat](/connectors/googlechat) | `connectors.googlechat` | `token` or `apiKey` present |
| [Mattermost](/connectors/mattermost) | `connectors.mattermost` | `token` or `apiKey` present |
| [Farcaster](/connectors/farcaster) | `connectors.farcaster` | `token` or `apiKey` present |
| [Twitch](/connectors/twitch) | `connectors.twitch` | `token` or `apiKey` present |
| [Feishu](/connectors/feishu) | `connectors.feishu` | `token` or `apiKey` present |
| [Matrix](/connectors/matrix) | `connectors.matrix` | `token` or `apiKey` present |
| [Nostr](/connectors/nostr) | `connectors.nostr` | `token` or `apiKey` present |
| [Lens](/connectors/lens) | `connectors.lens` | `token` or `apiKey` present |
| [WeChat](/connectors/wechat) | `connectors.wechat` | `token` or `apiKey` present (Milady-specific, uses `@miladyai/plugin-wechat`) |

### Disabling a built-in connector

Even if credentials are present, you can prevent a connector from loading:

```json
{
  "plugins": {
    "entries": {
      "discord": { "enabled": false }
    }
  }
}
```

Or add the plugin to the deny list:

```json
{
  "plugins": {
    "deny": ["@elizaos/plugin-discord"]
  }
}
```

## Registry-Installable Connectors

These connectors are available in the elizaOS plugin registry but are **not bundled** with Milady. Install them first, then configure normally.

| Connector | Install command |
|-----------|----------------|
| [Bluesky](/connectors/bluesky) | `milady plugins install bluesky` |
| [Instagram](/connectors/instagram) | `milady plugins install instagram` |
| [LINE](/connectors/line) | `milady plugins install line` |
| [Zalo](/connectors/zalo) | `milady plugins install zalo` |
| [Twilio](/connectors/twilio) | `milady plugins install twilio` |
| [GitHub](/connectors/github) | `milady plugins install github` |
| [Gmail Watch](/connectors/gmail-watch) | `milady plugins install gmail-watch` |
| [Nextcloud Talk](/connectors/nextcloud-talk) | `milady plugins install nextcloud-talk` |
| [Tlon](/connectors/tlon) | `milady plugins install tlon` |

After installing, add the connector's configuration to `milady.json` and it will auto-enable on next startup.

## Multi-Account Support

Most connectors support running multiple accounts simultaneously. Configure each account under the `accounts` key:

```json
{
  "connectors": {
    "telegram": {
      "accounts": {
        "bot-1": { "token": "...", "enabled": true },
        "bot-2": { "token": "...", "enabled": true }
      }
    }
  }
}
```

See each connector's documentation for account-specific configuration options.

## Related

- [Plugin Overview](/plugins/overview) — How the plugin system works
- [REST API — Connectors](/rest/connectors) — Connector management API
- [CLI — Plugins](/cli/plugins) — Install and manage plugins from the command line
