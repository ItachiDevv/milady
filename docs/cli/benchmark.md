---
title: benchmark
sidebarTitle: benchmark
description: Run benchmark tasks headlessly against the Milady agent runtime.
---

Run a benchmark task headlessly against the Milady agent runtime. The benchmark system executes prompts through the canonical message pipeline and returns structured JSON results with response text, actions taken, and timing data.

## Usage

```bash
# Run a single task from a file
milady benchmark --task path/to/task.json

# Run a single task from stdin
cat task.json | milady benchmark

# Server mode — persistent runtime, reads line-delimited JSON from stdin
milady benchmark --server
```

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--task <path>` | Path to a task JSON file | — |
| `--server` | Keep the runtime alive and accept tasks via stdin (line-delimited JSON) | `false` |
| `--timeout <ms>` | Timeout per task in milliseconds | `120000` |

## Task Format

Each task is a JSON object with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique task identifier |
| `prompt` | string | Yes | The task prompt or question |
| `type` | string | No | `"coding"` or `"research"` (auto-detected from prompt keywords if omitted) |
| `context` | object | No | Additional context data attached to the prompt |
| `expected` | string | No | Expected output for validation |

### Example task file

```json
{
  "id": "coding-task-1",
  "type": "coding",
  "prompt": "Implement a function that validates email addresses",
  "context": { "framework": "typescript", "target": "node" },
  "expected": "Should handle common email patterns"
}
```

Minimal task:

```json
{
  "id": "task-123",
  "prompt": "Write a hello world function in TypeScript"
}
```

## Output Format

Each task produces a JSON result on stdout:

```json
{
  "id": "task-123",
  "response": "Here is the function...",
  "actions_taken": ["coding"],
  "duration_ms": 2543,
  "success": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Task ID from input |
| `response` | string | The agent's response text |
| `actions_taken` | string[] | Actions executed during the task |
| `duration_ms` | number | Execution time in milliseconds |
| `success` | boolean | Whether the task completed without error |
| `error` | string | Error message (only present on failure) |

## Modes

### Single-task mode (default)

Reads one task from `--task <file>` or stdin, executes it, writes one result to stdout, and exits. Exit code `0` on success, `1` on failure.

### Server mode (`--server`)

Boots the runtime once and keeps it alive. Reads line-delimited JSON tasks from stdin, executes each one, and writes a result JSON line to stdout per task. Continues until stdin closes.

```bash
echo '{"id":"t1","prompt":"What is 2+2?"}
{"id":"t2","prompt":"Write hello in Python"}' | milady benchmark --server
```

## Task Type Detection

When `type` is omitted, the benchmark auto-detects based on prompt keywords:

- **coding** — triggered by words like "implement", "build", "write", "code", "function", "class", "module", "api", "endpoint", "refactor", "debug", "fix bug"
- **research** — default when no coding keywords are found

The detected type influences prompt augmentation: coding tasks receive instructions to produce complete code with imports and error handling; research tasks receive instructions for structured answers with headings.

## HTTP Benchmark Server

For integration with Python benchmark runners (e.g., AgentBench), Milady also provides an HTTP benchmark server:

```bash
bun run benchmark:server
```

See `packages/app-core/src/benchmark/README.md` for the HTTP API reference, including endpoints for `/api/benchmark/health`, `/api/benchmark/reset`, `/api/benchmark/message`, and CUA benchmark support.

## Related

- [CLI Overview](/cli/overview) — All available CLI commands
- [Start](/cli/start) — Start the agent runtime
