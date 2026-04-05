/**
 * Module-level state for the EZTexting plugin.
 *
 * Keeps resolved credentials available to actions and providers
 * without passing them through every call.
 *
 * @module plugin-eztexting/state
 */
import type { EZTextingCredentials, EZTextingPluginConfig } from "./types";
import { resolveCredentials } from "./eztexting-client";

let currentCredentials: EZTextingCredentials | null = null;
let currentConfig: EZTextingPluginConfig = {};

export function initCredentials(config: EZTextingPluginConfig): void {
  currentConfig = { ...config };
  currentCredentials = resolveCredentials(config);
}

export function getCredentials(): EZTextingCredentials | null {
  return currentCredentials;
}

export function getConfig(): EZTextingPluginConfig {
  return { ...currentConfig };
}
