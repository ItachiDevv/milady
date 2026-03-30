---
title: GitHub Connector
sidebarTitle: GitHub
description: Connect your agent to GitHub using the @elizaos/plugin-github package.
---

Connect your agent to GitHub for repository management, issue tracking, and pull request workflows.

## Overview

The GitHub connector is an elizaOS plugin that bridges your agent to the GitHub API. It supports repository management, issue tracking, pull request creation and review, and code search.

<Info>
This connector is **not bundled** with Milady. It is an elizaOS registry plugin that must be installed manually (`milady plugins install github`) before use.
</Info>

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-github` |
| Config key | `connectors.github` |
| Install | `milady plugins install github` |

## Setup Requirements

- GitHub API token (personal access token or fine-grained token)

## Configuration

```json
{
  "connectors": {
    "github": {
      "enabled": true
    }
  }
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GITHUB_API_TOKEN` | Personal access token or fine-grained token |
| `GITHUB_OWNER` | Default repository owner |
| `GITHUB_REPO` | Default repository name |

## Features

- Repository management
- Issue tracking and creation
- Pull request workflows (create, review, merge)
- Code search and file access

## Related

- [Connectors overview](/guides/connectors#github)
