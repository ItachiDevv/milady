---
title: "Vision Plugin"
sidebarTitle: "Vision"
description: "Vision plugin for Milady — image understanding and visual analysis capabilities for agents."
---

The Vision plugin gives Milady agents the ability to understand and analyze images, enabling visual reasoning in conversations.

**Package:** `@elizaos/plugin-vision`

## Installation

```bash
milady plugins install vision
```

## Auto-Enable

The plugin auto-enables via two mechanisms:

**1. Feature flag** — Set the `vision` feature flag in `milady.json`:

```json
{
  "features": {
    "vision": true
  }
}
```

**2. Media config** — The plugin also auto-enables when a vision provider is configured:

```json
{
  "media": {
    "vision": {
      "provider": "openai"
    }
  }
}
```

**Note:** This plugin requires the `@tensorflow/tfjs-node` native addon. On systems without native build tools, set `MILADY_NO_VISION_DEPS=1` to skip installation of optional vision dependencies.

## Features

- Image understanding and description
- Visual analysis of screenshots and photos
- Feature-gated — loaded when explicitly enabled via feature flag or media config

## Related

- [Browser Plugin](/plugin-registry/browser) — Web automation with screenshot capture
- [Computer Use Plugin](/plugin-registry/computeruse) — Full desktop automation
- [Image Generation Plugin](/plugin-registry/image-generation) — Generate images
