---
title: "Vision Plugin"
sidebarTitle: "Vision"
description: "Vision plugin for Milady — image understanding and visual analysis capabilities for agents."
---

The Vision plugin provides camera integration and visual awareness for Milady agents, enabling them to capture and analyze images from connected cameras.

**Package:** `@elizaos/plugin-vision`

## Installation

```bash
milady plugins install vision
```

## Enable via Features

```json
{
  "features": {
    "vision": true
  }
}
```

**Note:** This plugin requires native dependencies for camera access. On systems without native build tools, set `MILADY_NO_VISION_DEPS=1` to skip installation of optional vision dependencies.

## Configuration

| Environment Variable | Required | Description |
|---------------------|----------|-------------|
| `CAMERA_NAME` | No | Name of the camera device to use |
| `PIXEL_CHANGE_THRESHOLD` | No | Sensitivity threshold for detecting visual changes |

## Features

- Camera integration and visual awareness
- Image capture and analysis from connected cameras
- Pixel change detection for visual monitoring
- Feature-gated — only loaded when explicitly enabled

## Related

- [Browser Plugin](/plugin-registry/browser) — Web automation with screenshot capture
- [Computer Use Plugin](/plugin-registry/computeruse) — Full desktop automation
- [Image Generation Plugin](/plugin-registry/image-generation) — Generate images
