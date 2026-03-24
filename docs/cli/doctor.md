---
title: "milady doctor"
sidebarTitle: "doctor"
description: "Run diagnostics to verify your Milady installation, configuration, and environment health."
---

The `doctor` command runs a suite of diagnostic checks to verify that your Milady installation is healthy and properly configured. It inspects the runtime environment, configuration, model provider keys, storage, and network, then prints a structured report with pass/fail/warn indicators and suggested fixes.

## Usage

```bash
milady doctor
```

### Options

| Flag | Description |
|------|-------------|
| `--fix` | Automatically fix issues where possible (runs safe sub-commands) |
| `--no-ports` | Skip port availability checks |
| `--json` | Output results as JSON (CI-friendly) |

### Examples

```bash
# Run all checks
milady doctor

# Auto-remediate fixable issues
milady doctor --fix

# CI-friendly JSON output (exits with code 1 if any check fails)
milady doctor --json
```

## Diagnostic Checks

Checks are grouped into four categories:

### System

| Check | Pass Condition |
|-------|---------------|
| Runtime | Bun >= 1.0 or Node.js >= 22 detected |
| Node modules | `node_modules/` directory exists at project root |
| Build artifacts | `dist/` directory exists at project root |

### Configuration

| Check | Pass Condition |
|-------|---------------|
| Config file | `~/.milady/milady.json` exists and is valid JSON |
| Model provider keys | At least one model provider API key is set (Anthropic, OpenAI, Ollama, etc.) |
| Eliza workspace | Local `../eliza` workspace is detected (when developing with symlinked packages) |
| Host config | Network and host configuration is valid |

### Storage

| Check | Pass Condition |
|-------|---------------|
| State directory | `~/.milady/` exists and is writable |
| Database | SQLite database file is accessible |
| Disk space | Sufficient free disk space available |

### Network

Port availability and connectivity checks (skipped with `--no-ports`).

## JSON Output

When using `--json`, the output is a JSON object with a `summary` and `checks` array:

```json
{
  "summary": {
    "pass": 8,
    "warn": 1,
    "fail": 0,
    "skip": 0
  },
  "checks": [
    {
      "label": "Runtime",
      "status": "pass",
      "category": "system",
      "detail": "Bun 1.2.0"
    }
  ]
}
```

Exit code is `1` if any check has `"fail"` status, `0` otherwise.

## Auto-Fix

When `--fix` is passed, the command attempts to auto-remediate issues that have an `autoFixable` flag. Only safe sub-commands (prefixed with `eliza `) are executed automatically. Manual fix suggestions are still printed for issues that require user intervention.

## Related

- [milady setup](/cli/setup) — Initialize the workspace
- [milady config](/cli/config) — Inspect configuration values
- [milady models](/cli/models) — Verify model provider key configuration
- [Environment Variables](/cli/environment) — All environment variables that affect diagnostics
