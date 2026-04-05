/**
 * EZTexting REST API client.
 *
 * Wraps the v1 REST API documented at
 * https://www.eztexting.com/developers/sms-api-documentation/rest
 *
 * @module plugin-eztexting/eztexting-client
 */
import { logger } from "@elizaos/core";
import type {
  EZTextingApiResponse,
  EZTextingCredentials,
  EZTextingMessage,
  EZTextingPluginConfig,
  SendMessageRequest,
} from "./types";

const DEFAULT_BASE_URL = "https://app.eztexting.com";

/**
 * Resolve credentials from plugin config + environment variables.
 * Returns null when required credentials are missing.
 */
export function resolveCredentials(
  config: EZTextingPluginConfig = {},
): EZTextingCredentials | null {
  const username =
    config.username ?? process.env.EZTEXTING_USERNAME ?? undefined;
  const password =
    config.password ?? process.env.EZTEXTING_PASSWORD ?? undefined;
  const phoneNumber =
    config.phoneNumber ?? process.env.EZTEXTING_PHONE_NUMBER ?? undefined;

  if (!username || !password || !phoneNumber) {
    return null;
  }

  return {
    username,
    password,
    phoneNumber: normalizePhoneNumber(phoneNumber),
    baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
  };
}

/**
 * Send an SMS message via the EZTexting API.
 */
export async function sendMessage(
  credentials: EZTextingCredentials,
  phoneNumbers: string[],
  message: string,
  options?: { stampToSend?: number; messageTypeId?: number },
): Promise<
  | { success: true; data: EZTextingMessage }
  | { success: false; error: string }
> {
  const normalizedNumbers = phoneNumbers.map(normalizePhoneNumber);
  const invalidNumbers = normalizedNumbers.filter(
    (n) => !/^\d{10}$/.test(n),
  );
  if (invalidNumbers.length > 0) {
    return {
      success: false,
      error: `Invalid phone number(s): ${invalidNumbers.join(", ")}. Must be 10-digit US numbers.`,
    };
  }

  if (!message.trim()) {
    return { success: false, error: "Message body cannot be empty." };
  }

  const body: SendMessageRequest = {
    PhoneNumbers: normalizedNumbers,
    Message: message,
  };
  if (options?.messageTypeId) {
    body.MessageTypeID = options.messageTypeId;
  }
  if (options?.stampToSend) {
    body.StampToSend = options.stampToSend;
  }

  const url = `${credentials.baseUrl}/sending/messages?format=json`;

  try {
    const formBody = new URLSearchParams();
    formBody.append("User", credentials.username);
    formBody.append("Password", credentials.password);
    formBody.append("Message", body.Message);
    for (const num of body.PhoneNumbers) {
      formBody.append("PhoneNumbers[]", num);
    }
    if (body.MessageTypeID !== undefined) {
      formBody.append("MessageTypeID", String(body.MessageTypeID));
    }
    if (body.StampToSend !== undefined) {
      formBody.append("StampToSend", String(body.StampToSend));
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody.toString(),
    });

    const json =
      (await response.json()) as EZTextingApiResponse<EZTextingMessage>;

    if (!response.ok || json.Response?.Code !== 201) {
      const errors = json.Response?.Errors?.join("; ") ?? response.statusText;
      logger.error(`[eztexting] Send failed: ${errors}`);
      return { success: false, error: errors };
    }

    return {
      success: true,
      data: json.Response.Entry ?? ({} as EZTextingMessage),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`[eztexting] Send request error: ${msg}`);
    return { success: false, error: msg };
  }
}

/**
 * Retrieve inbox / conversation messages for a phone number.
 */
export async function getInboxMessages(
  credentials: EZTextingCredentials,
  folder?: "Inbox" | "Trash",
): Promise<
  | { success: true; messages: EZTextingMessage[] }
  | { success: false; error: string }
> {
  const folderParam = folder ?? "Inbox";
  const url = `${credentials.baseUrl}/incoming-messages?format=json&FolderID=${folderParam}`;

  try {
    const formBody = new URLSearchParams();
    formBody.append("User", credentials.username);
    formBody.append("Password", credentials.password);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`,
      },
    });

    const json =
      (await response.json()) as EZTextingApiResponse<EZTextingMessage>;

    if (!response.ok) {
      const errors = json.Response?.Errors?.join("; ") ?? response.statusText;
      logger.error(`[eztexting] Inbox fetch failed: ${errors}`);
      return { success: false, error: errors };
    }

    return {
      success: true,
      messages: json.Response?.Entries ?? [],
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`[eztexting] Inbox request error: ${msg}`);
    return { success: false, error: msg };
  }
}

/**
 * Check delivery status for a specific message by ID.
 */
export async function getMessageStatus(
  credentials: EZTextingCredentials,
  messageId: string,
): Promise<
  | { success: true; data: EZTextingMessage }
  | { success: false; error: string }
> {
  const url = `${credentials.baseUrl}/sending/messages/${encodeURIComponent(messageId)}?format=json`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`,
      },
    });

    const json =
      (await response.json()) as EZTextingApiResponse<EZTextingMessage>;

    if (!response.ok) {
      const errors = json.Response?.Errors?.join("; ") ?? response.statusText;
      logger.error(`[eztexting] Status check failed: ${errors}`);
      return { success: false, error: errors };
    }

    return {
      success: true,
      data: json.Response?.Entry ?? ({} as EZTextingMessage),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`[eztexting] Status request error: ${msg}`);
    return { success: false, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip common US phone formatting to bare 10-digit string. */
export function normalizePhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // Strip leading country code "1" if 11 digits
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }
  return digits;
}
