/** @jsxImportSource solid-js */

/**
 * Banner shown during WebSocket reconnection attempts (amber) and
 * after all attempts are exhausted (red). Offers Retry when failed.
 *
 * SolidJS port of components/ConnectionFailedBanner.tsx
 */

import { Show, Switch, Match } from "solid-js";
import { isElectrobunRuntime } from "../../bridge";
import {
  backendConnection,
  backendDisconnectedBannerDismissed,
  setBackendDisconnectedBannerDismissed,
} from "../store";

/** Call this from the WebSocket reconnect logic to trigger a retry. */
export function retryBackendConnection() {
  // Consumers wire up the actual reconnect logic externally;
  // this is a no-op stub — override by re-exporting or wrapping.
}

export function ConnectionFailedBanner() {
  const bannerTop = isElectrobunRuntime() ? 40 : 0;

  return (
    <Show when={backendConnection() !== null}>
      <Switch>
        <Match when={backendConnection()?.state === "reconnecting"}>
          <div
            class="fixed left-0 right-0 z-[9999] flex items-center gap-3 bg-amber-500 px-4 py-2 text-[13px] font-medium text-white shadow-lg"
            style={{ top: `${bannerTop}px` }}
          >
            <svg
              class="h-4 w-4 shrink-0 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-label="Reconnecting"
              role="img"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span class="truncate">
              Reconnecting (attempt {backendConnection()?.reconnectAttempt}/
              {backendConnection()?.maxReconnectAttempts})
            </span>
          </div>
        </Match>

        <Match
          when={
            backendConnection()?.state === "failed" &&
            !backendDisconnectedBannerDismissed()
          }
        >
          <div
            class="fixed left-0 right-0 z-[9999] flex items-center justify-between gap-3 bg-danger px-4 py-2 text-[13px] font-medium text-white shadow-lg"
            style={{ top: `${bannerTop}px` }}
          >
            <span class="truncate">
              Connection lost after {backendConnection()?.maxReconnectAttempts}{" "}
              attempts. Real-time features unavailable.
            </span>
            <div class="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setBackendDisconnectedBannerDismissed(true)}
                class="rounded px-3 py-1 text-[12px] text-red-100 hover:bg-red-700 transition-colors cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={retryBackendConnection}
                class="rounded bg-white px-3 py-1 text-[12px] font-semibold text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </Match>
      </Switch>
    </Show>
  );
}
