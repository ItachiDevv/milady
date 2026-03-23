/**
 * SolidJS reactive store — signals-based state management.
 *
 * Each domain gets standalone signals. No providers, no contexts,
 * no re-render cascades. Components run once; only bound DOM nodes
 * update when their signal changes.
 *
 * This module can be imported from both SolidJS and React components.
 * React components use the bridge (solid/bridge.tsx) to subscribe.
 */

import { createMemo, createSignal } from "solid-js";
import { createStore, produce } from "solid-js/store";
import type {
  AgentStatus,
  CodingAgentSession,
  Conversation,
  ConversationMessage,
  ConversationMode,
  ImageAttachment,
} from "../api";
import type { UiShellMode } from "../state/ui-preferences";
import type { Tab } from "../navigation";

// ── Translation ─────────────────────────────────────────────────────

export const [uiLanguage, setUiLanguage] = createSignal("en");

// ── Navigation ──────────────────────────────────────────────────────

export const [tab, setTab] = createSignal<Tab>("companion");
export const uiShellMode = createMemo<UiShellMode>(() =>
  tab() === "companion" ? "companion" : "native",
);

// ── Lifecycle ───────────────────────────────────────────────────────

export const [connected, setConnected] = createSignal(false);
export const [agentStatus, setAgentStatus] = createSignal<AgentStatus | null>(null);
export const [startupPhase, setStartupPhase] = createSignal<string>("starting-backend");
export const [onboardingComplete, setOnboardingComplete] = createSignal(false);
export const [onboardingLoading, setOnboardingLoading] = createSignal(true);
export const [startupError, setStartupError] = createSignal<string | null>(null);

export type BackendConnectionState = {
  state: "connected" | "disconnected" | "reconnecting" | "failed";
  reconnectAttempt: number;
  maxReconnectAttempts: number;
  showDisconnectedUI: boolean;
};

export const [backendConnection, setBackendConnection] =
  createSignal<BackendConnectionState | null>(null);
export const [backendDisconnectedBannerDismissed, setBackendDisconnectedBannerDismissed] =
  createSignal(false);

export const startupStatus = createMemo(() => {
  if (startupError()) return "recoverable-error";
  if (onboardingLoading() || startupPhase() !== "ready") return "loading";
  if (!onboardingComplete()) return "onboarding";
  return "ready";
});

// ── Chat ────────────────────────────────────────────────────────────

export const [chatInput, setChatInput] = createSignal("");
export const [chatSending, setChatSending] = createSignal(false);
export const [chatFirstTokenReceived, setChatFirstTokenReceived] = createSignal(false);
export const [activeConversationId, setActiveConversationId] = createSignal<string | null>(null);
export const [companionMessageCutoffTs, setCompanionMessageCutoffTs] = createSignal(0);
export const [chatAvatarSpeaking, setChatAvatarSpeaking] = createSignal(false);
export const [chatAgentVoiceMuted, setChatAgentVoiceMuted] = createSignal(false);
export const [chatMode, setChatMode] = createSignal<ConversationMode>("simple");

// Use createStore for arrays/objects — granular updates without replacing the whole array
export const [conversations, setConversations] = createStore<Conversation[]>([]);
export const [conversationMessages, setConversationMessages] = createStore<ConversationMessage[]>([]);

// ── Character ───────────────────────────────────────────────────────

export const [selectedVrmIndex, setSelectedVrmIndex] = createSignal(1);
export const [customVrmUrl, setCustomVrmUrl] = createSignal("");
export const [uiTheme, setUiTheme] = createSignal<string>("dark");

// ── Cloud ───────────────────────────────────────────────────────────

export const [elizaCloudConnected, setElizaCloudConnected] = createSignal(false);
export const [elizaCloudEnabled, setElizaCloudEnabled] = createSignal(false);

// ── System warnings ──────────────────────────────────────────────────

export const [systemWarnings, setSystemWarnings] = createSignal<string[]>([]);

export function dismissSystemWarning(message: string) {
  setSystemWarnings((prev) => prev.filter((w) => w !== message));
}

// ── Restart banner ──────────────────────────────────────────────────

export const [pendingRestart, setPendingRestart] = createSignal(false);
export const [pendingRestartReasons, setPendingRestartReasons] = createSignal<string[]>([]);
export const [restartBannerDismissed, setRestartBannerDismissed] = createSignal(false);

export function dismissRestartBanner() {
  setRestartBannerDismissed(true);
}

export async function triggerRestart(): Promise<void> {
  // Lazy import to avoid circular dependency at module load time
  const { client } = await import("../api/client");
  await client.restartAgent();
}

// ── Action notice ───────────────────────────────────────────────────

export const [actionNotice, setActionNotice] = createSignal<{
  text: string;
  tone: "info" | "success" | "error";
} | null>(null);

let actionNoticeTimer: ReturnType<typeof setTimeout> | null = null;

export function showActionNotice(
  text: string,
  tone: "info" | "success" | "error" = "info",
  ttlMs = 2800,
) {
  setActionNotice({ text, tone });
  if (actionNoticeTimer) clearTimeout(actionNoticeTimer);
  actionNoticeTimer = setTimeout(() => {
    setActionNotice(null);
    actionNoticeTimer = null;
  }, ttlMs);
}
