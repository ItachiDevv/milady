/**
 * RUN_IN_TERMINAL action — runs a shell command on the server.
 *
 * @module actions/terminal
 */

import { execSync } from "node:child_process";
import type { Action, HandlerOptions, Memory } from "@elizaos/core";

const FAIL = { success: false, text: "" } as const;
const MAX_OUTPUT_CHARS = 1800; // leave room for wrapper text within discord's 2000 char limit
const EXEC_TIMEOUT_MS = 15_000;

/**
 * Extract a command from handler options and message text.
 *
 * Resolution order:
 *   1. `parameters.command` — explicit parameter from TOON/XML parsing
 *   2. `parameters.arguments` — MCP-style JSON string
 *   3. Natural language regex extraction ("run X", "execute X")
 *   4. Backtick-wrapped command in message text
 *   5. Code-fenced command block in message text
 */
function getCommand(
  options?: HandlerOptions,
  message?: Memory,
): string | undefined {
  const params = options?.parameters as
    | { command?: string; arguments?: string }
    | undefined;

  if (params?.command) return params.command;

  if (typeof params?.arguments === "string") {
    try {
      const parsed = JSON.parse(params.arguments);
      if (parsed?.command) return parsed.command;
    } catch {
      // fall through
    }
  }

  const text = message?.content?.text;
  if (typeof text !== "string" || text.length === 0) return undefined;

  // "run X", "execute X", "start X", "do X"
  const match = text.match(
    /(?:run|execute|start|do)\s+(?:the\s+command\s+)?[`'"]*(.+?)[`'"]*[?.!]?\s*$/i,
  );
  if (match?.[1]) {
    const trimmed = match[1]
      .replace(/\s+(?:in|on|from|to|for|at)\s+(?:the\s+)?[\w\s]+$/i, "")
      .trim();
    if (trimmed) return trimmed;
  }

  // Single backtick-wrapped command
  const backtickMatch = text.match(/`([^`]+)`/);
  if (backtickMatch?.[1]) return backtickMatch[1];

  // Triple-backtick code fence
  const fenceMatch = text.match(/```(?:sh|bash|shell)?\n?([\s\S]+?)```/);
  if (fenceMatch?.[1]) {
    const cmd = fenceMatch[1].trim();
    if (cmd) return cmd;
  }

  return undefined;
}

export const terminalAction: Action = {
  name: "RUN_IN_TERMINAL",

  similes: [
    "RUN_COMMAND",
    "EXECUTE_COMMAND",
    "TERMINAL",
    "SHELL",
    "RUN_SHELL",
    "EXEC",
    "CALL_MCP_TOOL",
  ],

  description:
    "Run a shell command and return its output. Use for quick lookups: " +
    "checking prices (curl an API), disk usage (df -h), reading short files (head/tail), " +
    "process status (ps), network checks (curl -s URL), or any single command where " +
    "the user needs the RESULT, not just confirmation it ran. " +
    "Do NOT use for multi-step builds or projects — use CREATE_TASK instead.",

  validate: async (_runtime, message) => {
    // Only match messages that contain an explicit command the user typed.
    // Natural-language questions ("what's the price of bitcoin") should go
    // through CREATE_TASK where the subagent (claude code) has full bash and
    // will figure out what to run. RUN_IN_TERMINAL is for when the user
    // literally gives you a command to execute.
    const text = (message?.content?.text ?? "").trim();
    if (!text) return false;
    // Backtick-wrapped command: `df -h`
    if (/`[^`]+`/.test(text)) return true;
    // Code-fenced command
    if (/```/.test(text)) return true;
    // Explicit "run/execute/start" keyword
    if (/\b(?:run|execute|start)\s+\S/i.test(text)) return true;
    return false;
  },

  handler: async (_runtime, _message, _state, options) => {
    const command = getCommand(
      options as HandlerOptions | undefined,
      _message as Memory | undefined,
    );

    if (!command) {
      return FAIL;
    }

    // Run synchronously and capture output so discord (and any non-dashboard
    // connector) gets the actual result in the reply, not just "Running...".
    // The old path sent the command to the terminal API which streamed output
    // via WebSocket to the web dashboard — invisible to discord users.
    try {
      const raw = execSync(command, {
        timeout: EXEC_TIMEOUT_MS,
        maxBuffer: 1024 * 1024,
        encoding: "utf-8",
        cwd: process.env.HOME,
        stdio: ["pipe", "pipe", "pipe"],
      });
      const output = raw.trim();
      const truncated =
        output.length > MAX_OUTPUT_CHARS
          ? `${output.slice(0, MAX_OUTPUT_CHARS)}...(truncated)`
          : output;
      return {
        text: truncated || "(no output)",
        success: true,
        data: { command, output: truncated },
      };
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : String(err);
      const stderr =
        (err as { stderr?: string })?.stderr?.trim() ?? "";
      const summary = stderr
        ? stderr.slice(0, MAX_OUTPUT_CHARS)
        : msg.slice(0, MAX_OUTPUT_CHARS);
      return {
        text: `command failed: ${summary}`,
        success: false,
        data: { command, error: summary },
      };
    }
  },

  parameters: [
    {
      name: "command",
      description: "The shell command to execute in the terminal",
      required: true,
      schema: { type: "string" as const },
    },
  ],
};
