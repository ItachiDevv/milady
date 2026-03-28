---
title: Twilio Connector
sidebarTitle: Twilio
description: Connect your agent to Twilio for SMS and voice using the @elizaos/plugin-twilio package.
---

Connect your agent to Twilio for SMS messaging and voice call capabilities.

## Overview

The Twilio connector is an elizaOS plugin that bridges your agent to Twilio's communication APIs. It supports inbound and outbound SMS, as well as voice call handling with configurable policies and concurrent call limits. This connector is available from the plugin registry.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-twilio` |
| Config key | `connectors.twilio` |
| Availability | Registry (install required) |
| Install | `milady plugins install twilio` |

## Setup Requirements

1. A [Twilio account](https://www.twilio.com/try-twilio) with Account SID and Auth Token
2. A Twilio phone number (for sending/receiving SMS and calls)
3. A publicly accessible URL for webhooks (or use ngrok for development)

## Configuration

### Minimal (SMS only)

```json
{
  "connectors": {
    "twilio": {
      "enabled": true
    }
  },
  "env": {
    "TWILIO_ACCOUNT_SID": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "TWILIO_AUTH_TOKEN": "your_auth_token",
    "TWILIO_PHONE_NUMBER": "+15551234567"
  }
}
```

### Full Reference (SMS + Voice)

```json
{
  "connectors": {
    "twilio": {
      "enabled": true
    }
  },
  "env": {
    "TWILIO_ACCOUNT_SID": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "TWILIO_AUTH_TOKEN": "your_auth_token",
    "TWILIO_PHONE_NUMBER": "+15551234567",
    "TWILIO_WEBHOOK_URL": "https://your-domain.com/twilio/webhook",
    "TWILIO_WEBHOOK_PORT": "3100",
    "VOICE_CALL_ENABLED": "true",
    "VOICE_CALL_FROM_NUMBER": "+15551234567",
    "VOICE_CALL_WEBHOOK_PORT": "3101",
    "VOICE_CALL_WEBHOOK_PATH": "/voice",
    "VOICE_CALL_PUBLIC_URL": "https://your-domain.com",
    "VOICE_CALL_MAX_DURATION_SECONDS": "300",
    "VOICE_CALL_MAX_CONCURRENT_CALLS": "5",
    "VOICE_CALL_INBOUND_POLICY": "allow",
    "VOICE_CALL_ALLOW_FROM": "+15559876543,+15551112222",
    "VOICE_CALL_INBOUND_GREETING": "Hello, you've reached my AI assistant."
  }
}
```

## Environment Variables

### SMS

| Variable | Required | Sensitive | Description |
|----------|----------|-----------|-------------|
| `TWILIO_ACCOUNT_SID` | Yes | Yes | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Yes | Yes | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | No | No | Twilio phone number for sending/receiving |
| `TWILIO_WEBHOOK_URL` | No | No | Public URL for receiving inbound SMS |
| `TWILIO_WEBHOOK_PORT` | No | No | Port for the webhook listener |

### Voice Calls

| Variable | Required | Sensitive | Description |
|----------|----------|-----------|-------------|
| `VOICE_CALL_ENABLED` | No | No | Enable voice call handling |
| `VOICE_CALL_PROVIDER` | No | No | Voice provider selection |
| `VOICE_CALL_FROM_NUMBER` | No | No | Caller ID for outbound calls |
| `VOICE_CALL_TO_NUMBER` | No | No | Default number for outbound calls |
| `VOICE_CALL_WEBHOOK_PORT` | No | No | Port for the voice webhook listener |
| `VOICE_CALL_WEBHOOK_PATH` | No | No | URL path for voice webhooks |
| `VOICE_CALL_PUBLIC_URL` | No | No | Public-facing URL for voice webhook callbacks |
| `VOICE_CALL_MAX_DURATION_SECONDS` | No | No | Maximum call duration in seconds |
| `VOICE_CALL_MAX_CONCURRENT_CALLS` | No | No | Maximum number of simultaneous calls |
| `VOICE_CALL_INBOUND_POLICY` | No | No | Inbound call policy (`allow`, `deny`, `allowlist`) |
| `VOICE_CALL_ALLOW_FROM` | No | No | Comma-separated list of allowed caller numbers |
| `VOICE_CALL_INBOUND_GREETING` | No | No | Greeting message played when answering calls |

## Features

- **SMS messaging** — send and receive text messages via Twilio numbers
- **Voice calls** — handle inbound and make outbound voice calls
- **Webhook-based** — real-time inbound message and call handling
- **Inbound policies** — control who can call or message with allow/deny lists
- **Concurrent call limits** — cap simultaneous voice calls
- **Custom greetings** — configurable greeting for inbound voice calls

## Related

- [Connectors overview](/guides/connectors#twilio)
- [Plugin registry entry](/plugin-registry/platform/twilio)
- [Configuration reference](/configuration)
