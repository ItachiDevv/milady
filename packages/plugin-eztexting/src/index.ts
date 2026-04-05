/**
 * EZTexting elizaOS plugin — SMS messaging via EZTexting REST API.
 *
 * Enables the agent to send and receive SMS text messages through
 * the EZTexting platform. Requires EZTEXTING_USERNAME, EZTEXTING_PASSWORD,
 * and EZTEXTING_PHONE_NUMBER to be set (via env vars or plugin config).
 *
 * Registered textable number: (737) 372-5813
 *
 * @module plugin-eztexting
 */
import { type IAgentRuntime, logger, type Plugin } from "@elizaos/core";
import { checkSmsStatusAction, sendSmsAction } from "./action";
import { eztextingProvider } from "./provider";
import { initCredentials, getCredentials } from "./state";
import type { EZTextingPluginConfig } from "./types";

const eztextingPlugin: Plugin = {
  name: "@miladyai/plugin-eztexting",
  description:
    "SMS text messaging via EZTexting. Send and check delivery of SMS messages to US phone numbers.",
  providers: [eztextingProvider],
  actions: [sendSmsAction, checkSmsStatusAction],
  init: async (
    pluginConfig: Record<string, unknown>,
    _runtime: IAgentRuntime,
  ) => {
    const config = pluginConfig as EZTextingPluginConfig | undefined;
    initCredentials(config ?? {});

    const credentials = getCredentials();
    if (credentials) {
      const display = `(${credentials.phoneNumber.slice(0, 3)}) ${credentials.phoneNumber.slice(3, 6)}-${credentials.phoneNumber.slice(6)}`;
      logger.info(
        `[eztexting] Plugin initialized — textable number: ${display}`,
      );
    } else {
      logger.warn(
        "[eztexting] Plugin loaded but not configured. Set EZTEXTING_USERNAME, EZTEXTING_PASSWORD, and EZTEXTING_PHONE_NUMBER.",
      );
    }
  },
};

export type { EZTextingPluginConfig, EZTextingCredentials } from "./types";
export { sendSmsAction, checkSmsStatusAction } from "./action";
export { eztextingProvider } from "./provider";
export { resolveCredentials, normalizePhoneNumber } from "./eztexting-client";

export default eztextingPlugin;
