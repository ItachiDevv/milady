/**
 * EZTexting plugin actions: SEND_SMS, CHECK_SMS_STATUS.
 *
 * @module plugin-eztexting/action
 */
import type { Action, ActionExample, HandlerOptions, Memory } from "@elizaos/core";
import {
  getMessageStatus,
  normalizePhoneNumber,
  sendMessage,
} from "./eztexting-client";
import { getCredentials } from "./state";

// ---------------------------------------------------------------------------
// SEND_SMS
// ---------------------------------------------------------------------------

export const sendSmsAction: Action = {
  name: "SEND_SMS",
  similes: [
    "TEXT_MESSAGE",
    "SEND_TEXT",
    "SMS_SEND",
    "SEND_MESSAGE_SMS",
    "TEXT_SOMEONE",
  ],
  description:
    "Send an SMS text message to one or more US phone numbers via EZTexting. " +
    "The agent's registered number is (737) 372-5813.",
  validate: async () => {
    return getCredentials() !== null;
  },
  handler: async (
    _runtime,
    message,
    _state,
    options?: HandlerOptions,
  ) => {
    const credentials = getCredentials();
    if (!credentials) {
      return {
        success: false,
        text: "EZTexting is not configured. Set EZTEXTING_USERNAME, EZTEXTING_PASSWORD, and EZTEXTING_PHONE_NUMBER.",
      };
    }

    const params = options?.parameters as
      | {
          phoneNumbers?: string[] | string;
          message?: string;
          scheduleTimestamp?: number;
        }
      | undefined;

    const phoneNumbers = parsePhoneNumbers(
      params?.phoneNumbers,
      getMessageText(message),
    );
    if (phoneNumbers.length === 0) {
      return {
        success: false,
        text: "Provide at least one 10-digit US phone number to send an SMS to.",
      };
    }

    const smsBody =
      params?.message ??
      extractMessageBody(getMessageText(message), phoneNumbers);
    if (!smsBody?.trim()) {
      return {
        success: false,
        text: "Provide a message body for the SMS.",
      };
    }

    const result = await sendMessage(credentials, phoneNumbers, smsBody, {
      stampToSend: params?.scheduleTimestamp,
    });

    if (!result.success) {
      return { success: false, text: `Failed to send SMS: ${result.error}` };
    }

    const recipientList = phoneNumbers.join(", ");
    return {
      success: true,
      text: `SMS sent to ${recipientList}: "${smsBody}"`,
      data: {
        messageId: result.data.ID,
        recipients: phoneNumbers,
        message: smsBody,
      },
    };
  },
  parameters: [
    {
      name: "phoneNumbers",
      description:
        "One or more 10-digit US phone numbers to send the SMS to. Can be a single string or an array.",
      required: true,
      schema: {
        type: "array" as const,
        items: { type: "string" as const },
      },
    },
    {
      name: "message",
      description: "The text content of the SMS message to send.",
      required: true,
      schema: { type: "string" as const },
    },
    {
      name: "scheduleTimestamp",
      description:
        "Optional Unix timestamp to schedule the message for future delivery.",
      required: false,
      schema: { type: "number" as const },
    },
  ],
  examples: [
    [
      {
        name: "{{name1}}",
        content: { text: "Send a text to 5551234567 saying 'Hey, meeting at 3pm'" },
      },
      {
        name: "{{agentName}}",
        content: {
          text: 'SMS sent to 5551234567: "Hey, meeting at 3pm"',
          action: "SEND_SMS",
        },
      },
    ],
    [
      {
        name: "{{name1}}",
        content: { text: "Text 555-123-4567 and 555-987-6543: Reminder about tomorrow's event" },
      },
      {
        name: "{{agentName}}",
        content: {
          text: 'SMS sent to 5551234567, 5559876543: "Reminder about tomorrow\'s event"',
          action: "SEND_SMS",
        },
      },
    ],
  ] as ActionExample[][],
};

// ---------------------------------------------------------------------------
// CHECK_SMS_STATUS
// ---------------------------------------------------------------------------

export const checkSmsStatusAction: Action = {
  name: "CHECK_SMS_STATUS",
  similes: [
    "SMS_STATUS",
    "MESSAGE_STATUS",
    "CHECK_TEXT_STATUS",
    "SMS_DELIVERY_STATUS",
  ],
  description:
    "Check the delivery status of a previously sent SMS message by its ID.",
  validate: async () => {
    return getCredentials() !== null;
  },
  handler: async (
    _runtime,
    message,
    _state,
    options?: HandlerOptions,
  ) => {
    const credentials = getCredentials();
    if (!credentials) {
      return {
        success: false,
        text: "EZTexting is not configured.",
      };
    }

    const params = options?.parameters as
      | { messageId?: string }
      | undefined;

    const messageId =
      params?.messageId ?? extractMessageId(getMessageText(message));

    if (!messageId) {
      return {
        success: false,
        text: "Provide a message ID to check the delivery status.",
      };
    }

    const result = await getMessageStatus(credentials, messageId);
    if (!result.success) {
      return {
        success: false,
        text: `Failed to check status: ${result.error}`,
      };
    }

    const status = result.data.Status ?? "unknown";
    return {
      success: true,
      text: `Message ${messageId} status: ${status}`,
      data: result.data,
    };
  },
  parameters: [
    {
      name: "messageId",
      description: "The ID of the SMS message to check status for.",
      required: true,
      schema: { type: "string" as const },
    },
  ],
  examples: [
    [
      {
        name: "{{name1}}",
        content: { text: "Check the status of message 12345" },
      },
      {
        name: "{{agentName}}",
        content: {
          text: "Message 12345 status: delivered",
          action: "CHECK_SMS_STATUS",
        },
      },
    ],
  ] as ActionExample[][],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMessageText(message?: Memory): string {
  return typeof message?.content?.text === "string" ? message.content.text : "";
}

function parsePhoneNumbers(
  paramValue: string[] | string | undefined,
  text: string,
): string[] {
  let raw: string[];

  if (Array.isArray(paramValue)) {
    raw = paramValue;
  } else if (typeof paramValue === "string") {
    raw = paramValue.split(/[,;\s]+/).filter(Boolean);
  } else {
    // Extract phone numbers from natural language text
    raw = extractPhoneNumbersFromText(text);
  }

  return [...new Set(raw.map(normalizePhoneNumber).filter((n) => /^\d{10}$/.test(n)))];
}

function extractPhoneNumbersFromText(text: string): string[] {
  // Match patterns like (737) 372-5813, 737-372-5813, 7373725813, +1-737-372-5813
  const phoneRegex =
    /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const matches = text.match(phoneRegex) ?? [];
  return matches.map((m) => m.replace(/\D/g, ""));
}

function extractMessageBody(
  text: string,
  phoneNumbers: string[],
): string | null {
  // Try to extract a quoted message first
  const quotedMatch = text.match(/['"](.*?)['"]/);
  if (quotedMatch?.[1]) return quotedMatch[1];

  // Try "saying <message>" or ": <message>" pattern
  const sayingMatch = text.match(/\bsaying\s+(.+)/i);
  if (sayingMatch?.[1]) return sayingMatch[1].replace(/['"]/g, "").trim();

  const colonMatch = text.match(/:\s*(.+)$/);
  if (colonMatch?.[1]) {
    // Make sure it's not just a phone number
    const candidate = colonMatch[1].trim();
    const digits = candidate.replace(/\D/g, "");
    if (!phoneNumbers.includes(digits)) return candidate;
  }

  return null;
}

function extractMessageId(text: string): string | null {
  const match = text.match(/\b(?:message|msg|id)\s*#?\s*(\d+)\b/i);
  return match?.[1] ?? null;
}
