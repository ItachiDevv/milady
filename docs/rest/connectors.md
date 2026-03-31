---
title: "Connectors API"
sidebarTitle: "Connectors"
description: "REST API endpoints for managing platform connectors — Telegram, Discord, WhatsApp, and 16 other messaging integrations."
---

The connectors API manages the agent's platform connector configurations. Connectors bridge the agent to external messaging platforms. Configuration is persisted to the Milady config file. Changes typically require a restart to take effect.

## Supported Connector Types

Milady auto-enables connector plugins when their configuration block is present under `connectors.<name>` in `milady.json`. The 19 auto-enabled connectors are:

| Name | Plugin | Primary Config Key |
|------|--------|--------------------|
| `telegram` | `@elizaos/plugin-telegram` | `botToken` |
| `discord` | `@elizaos/plugin-discord` | `token` |
| `slack` | `@elizaos/plugin-slack` | `botToken` |
| `twitter` | `@elizaos/plugin-twitter` | `token` |
| `whatsapp` | `@elizaos/plugin-whatsapp` | `authDir` |
| `signal` | `@elizaos/plugin-signal` | `authDir` |
| `bluebubbles` | `@elizaos/plugin-bluebubbles` | `serverUrl` |
| `imessage` | `@elizaos/plugin-imessage` | `applescriptPath` |
| `farcaster` | `@elizaos/plugin-farcaster` | `token` |
| `lens` | `@elizaos/plugin-lens` | `token` |
| `msteams` | `@elizaos/plugin-msteams` | `botToken` |
| `mattermost` | `@elizaos/plugin-mattermost` | `serverUrl` |
| `googlechat` | `@elizaos/plugin-google-chat` | `token` |
| `feishu` | `@elizaos/plugin-feishu` | `appId` |
| `matrix` | `@elizaos/plugin-matrix` | `serverUrl` |
| `nostr` | `@elizaos/plugin-nostr` | `token` |
| `blooio` | `@elizaos/plugin-blooio` | `apiKey` |
| `twitch` | `@elizaos/plugin-twitch` | `token` |
| `wechat` | `@miladyai/plugin-wechat` | `apiKey` |

Additional connectors (Bluesky, Instagram, LINE, Zalo, Twilio, GitHub, Gmail Watch, Nextcloud Talk, Tlon) are available from the [elizaOS plugin registry](/plugins/registry) via `milady plugins install`.

All connectors share these common config options:

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | boolean | Explicitly enable or disable the connector |
| `dmPolicy` | string | Direct message policy |
| `allowFrom` | string[] | Allowed sender IDs |
| `groupPolicy` | string | Group message policy |

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/connectors` | List all configured connectors |
| POST | `/api/connectors` | Add or update a connector |
| DELETE | `/api/connectors/:name` | Remove a connector |

---

### GET /api/connectors

Returns all configured connectors with secrets redacted.

**Response**

```json
{
  "connectors": {
    "telegram": {
      "botToken": "****:****"
    },
    "discord": {
      "token": "****"
    }
  }
}
```

---

### POST /api/connectors

Add a new connector or update an existing one. The connector config is saved to the Milady config file.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Connector identifier (e.g. `telegram`, `discord`, `whatsapp`) |
| `config` | object | Yes | Connector-specific configuration |

```json
{
  "name": "telegram",
  "config": {
    "botToken": "123456:ABC-DEF..."
  }
}
```

**Response**

Returns the updated connectors map (with secrets redacted):

```json
{
  "connectors": {
    "telegram": {
      "botToken": "****:****"
    }
  }
}
```

**Errors**

| Status | Condition |
|--------|-----------|
| 400 | Missing connector name |
| 400 | Name is a reserved key (`__proto__`, `constructor`, `prototype`) |
| 400 | Missing connector config object |

---

### DELETE /api/connectors/:name

Remove a connector from the configuration. Also removes from the legacy `channels` config key if present.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Connector name (URL-encoded) |

**Response**

Returns the updated connectors map:

```json
{
  "connectors": {}
}
```

**Errors**

| Status | Condition |
|--------|-----------|
| 400 | Missing or invalid connector name |
