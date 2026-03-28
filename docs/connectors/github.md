---
title: GitHub Connector
sidebarTitle: GitHub
description: Connect your agent to GitHub using the @elizaos/plugin-github package.
---

Connect your agent to GitHub for repository management, issue tracking, and pull request workflows.

## Overview

The GitHub connector is an elizaOS plugin that bridges your agent to the GitHub API. It supports repository management, issue tracking, pull request creation and review, code search, and webhook-driven event handling. This connector is available from the plugin registry and must be installed manually.

## Package Info

| Field | Value |
|-------|-------|
| Package | `@elizaos/plugin-github` |
| Config key | `connectors.github` |
| Availability | Registry (install required) |
| Install | `milady plugins install github` |

## Setup Requirements

1. A GitHub account
2. A personal access token (classic or fine-grained) **or** a GitHub App with credentials
3. Install the plugin: `milady plugins install github`

## Authentication Methods

The plugin supports three authentication approaches:

### Personal Access Token (recommended for getting started)

Generate a token at [github.com/settings/tokens](https://github.com/settings/tokens). For fine-grained tokens, grant the repository permissions your agent needs (issues, pull requests, contents).

### GitHub App

For organization-level access or tighter permission scoping, create a GitHub App and provide the app ID, private key, and installation ID.

## Configuration

### Minimal

```json
{
  "connectors": {
    "github": {
      "enabled": true
    }
  }
}
```

With the API token set as an environment variable:

```bash
export GITHUB_API_TOKEN=ghp_your_token_here
```

### Full Reference

```json
{
  "connectors": {
    "github": {
      "enabled": true
    }
  },
  "env": {
    "GITHUB_API_TOKEN": "ghp_your_token_here",
    "GITHUB_OWNER": "your-org-or-username",
    "GITHUB_REPO": "your-repo",
    "GITHUB_BRANCH": "main"
  }
}
```

## Environment Variables

| Variable | Required | Sensitive | Description |
|----------|----------|-----------|-------------|
| `GITHUB_API_TOKEN` | Yes | Yes | Personal access token or fine-grained token |
| `GITHUB_OWNER` | No | No | Default repository owner (username or organization) |
| `GITHUB_REPO` | No | No | Default repository name |
| `GITHUB_BRANCH` | No | No | Default branch name (defaults to `main`) |
| `GITHUB_WEBHOOK_SECRET` | No | Yes | Secret for validating GitHub webhook payloads |
| `GITHUB_APP_ID` | No | No | GitHub App ID for app-based authentication |
| `GITHUB_APP_PRIVATE_KEY` | No | Yes | GitHub App private key (PEM format) |
| `GITHUB_INSTALLATION_ID` | No | No | GitHub App installation ID |

## Features

- **Repository management** — browse repos, read files, search code
- **Issue tracking** — create, update, comment on, and close issues
- **Pull request workflows** — create PRs, add reviews, merge
- **Code search** — search across repositories for code patterns
- **Webhook event handling** — receive and respond to GitHub events when `GITHUB_WEBHOOK_SECRET` is configured

## Auto-Enable

Unlike most connectors, GitHub is **not** auto-enabled. You must explicitly install and enable it:

```bash
milady plugins install github
```

Then add `connectors.github.enabled: true` to your config or set the environment variables.

## Related

- [Connectors overview](/guides/connectors#github)
- [Plugin registry entry](/plugin-registry/platform/github)
- [Configuration reference](/configuration)
