/**
 * Types and configuration for the EZTexting plugin.
 *
 * @module plugin-eztexting/types
 */

/** Plugin configuration passed via milady.json `plugins.entries.eztexting.config`. */
export interface EZTextingPluginConfig {
  /** EZTexting username (or set via EZTEXTING_USERNAME env var). */
  username?: string;
  /** EZTexting password (or set via EZTEXTING_PASSWORD env var). */
  password?: string;
  /**
   * The textable phone number registered with EZTexting (10-digit US number).
   * Used as the "from" number context. Defaults to EZTEXTING_PHONE_NUMBER env var.
   */
  phoneNumber?: string;
  /** Base URL override for the EZTexting API. */
  baseUrl?: string;
}

/** Resolved credentials after merging config + env vars. */
export interface EZTextingCredentials {
  username: string;
  password: string;
  phoneNumber: string;
  baseUrl: string;
}

// ---------------------------------------------------------------------------
// API request / response types
// ---------------------------------------------------------------------------

/** Payload for sending an SMS via the EZTexting REST API. */
export interface SendMessageRequest {
  /** Array of 10-digit US phone numbers. */
  PhoneNumbers: string[];
  /** SMS message body (max 160 chars for a single segment). */
  Message: string;
  /**
   * Message type: 1 = Express (shared shortcode), 3 = MMS.
   * Defaults to 1.
   */
  MessageTypeID?: number;
  /** Optional Unix timestamp to schedule the message for later. */
  StampToSend?: number;
}

/** A single message record returned by the EZTexting API. */
export interface EZTextingMessage {
  ID?: string;
  Subject?: string;
  Message?: string;
  MessageTypeID?: number;
  PhoneNumbers?: string[];
  Groups?: string[];
  CreatedAt?: string;
  Status?: string;
}

/** Wrapper envelope used by the EZTexting REST API. */
export interface EZTextingApiResponse<T = unknown> {
  Response: {
    Status: string;
    Code: number;
    Entry?: T;
    Entries?: T[];
    Errors?: string[];
  };
}
