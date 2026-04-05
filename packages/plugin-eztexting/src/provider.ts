/**
 * EZTexting context provider.
 *
 * Injects SMS capability information into the agent's context so the LLM
 * knows it can send text messages and which number it texts from.
 *
 * @module plugin-eztexting/provider
 */
import type { Provider } from "@elizaos/core";
import { getCredentials } from "./state";

export const eztextingProvider: Provider = {
  name: "eztexting",
  description:
    "Provides SMS texting capability via the EZTexting service. " +
    "Tells the agent it can send and receive SMS messages.",
  get: async () => {
    const credentials = getCredentials();

    if (!credentials) {
      return {
        text: "EZTexting SMS service is not configured. To enable SMS, set EZTEXTING_USERNAME, EZTEXTING_PASSWORD, and EZTEXTING_PHONE_NUMBER.",
        values: {
          eztextingAvailable: false,
        },
      };
    }

    const formattedNumber = formatPhoneForDisplay(credentials.phoneNumber);

    return {
      text: [
        `EZTexting SMS service is available. Your textable number is ${formattedNumber}.`,
        "You can send SMS text messages to US phone numbers using the SEND_SMS action.",
        "You can check delivery status of sent messages using the CHECK_SMS_STATUS action.",
        "Phone numbers should be 10-digit US numbers.",
      ].join(" "),
      values: {
        eztextingAvailable: true,
        eztextingPhoneNumber: credentials.phoneNumber,
        eztextingFormattedNumber: formattedNumber,
      },
    };
  },
};

function formatPhoneForDisplay(digits: string): string {
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return digits;
}
