/**
 * RUN_IN_TERMINAL action — runs a shell command on the server.
 *
 * @module actions/terminal
 */

import type { Action, HandlerOptions, Memory } from "@elizaos/core";

const API_PORT = process.env.API_PORT || process.env.SERVER_PORT || "2138";
const FAIL = { success: false, text: "" } as const;

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
    "Run a shell command in the user's terminal. Use this when the user asks " +
    "you to run a command, execute a script, install packages, or perform " +
    "any terminal operation. Output is shown in real time.",

  validate: async () => true,

  handler: async (_runtime, _message, _state, options) => {
    const command = getCommand(
      options as HandlerOptions | undefined,
      _message as Memory | undefined,
    );

    if (!command) {
      return FAIL;
    }

    try {
      const response = await fetch(
        `http://localhost:${API_PORT}/api/terminal/run`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            command,
            clientId: "runtime-terminal-action",
          }),
        },
      );

      if (!response.ok) {
        return FAIL;
      }

      return {
        text: `Running in terminal: \`${command}\``,
        success: true,
        data: { command },
      };
    } catch {
      return FAIL;
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
