---
title: "milady benchmark"
sidebarTitle: "benchmark"
description: "Run a benchmark task headlessly against the Milady agent."
---

Run a benchmark task headlessly against the Milady agent runtime. The agent starts, executes the task, and exits. Useful for automated evaluation pipelines and CI.

## Usage

```bash
milady benchmark [options]
```

## Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--task <path>` | string | (none) | Path to a task JSON file describing the benchmark |
| `--server` | boolean | false | Keep the runtime alive and accept tasks via stdin (line-delimited JSON) |
| `--timeout <ms>` | number | `120000` | Timeout per task in milliseconds |

## Examples

```bash
# Run a single benchmark task
milady benchmark --task benchmarks/tasks/research.json

# Run with a custom timeout (5 minutes)
milady benchmark --task benchmarks/tasks/complex.json --timeout 300000

# Server mode — accept tasks via stdin
milady benchmark --server
```

### Server Mode

When `--server` is passed, the agent stays running and reads task JSON objects from stdin (one per line). This is useful for batch evaluation where spinning up the runtime for each task would be expensive.

## Related

- [CLI Overview](/cli/overview) — All CLI commands
- [milady start](/cli/start) — Start the agent runtime interactively
