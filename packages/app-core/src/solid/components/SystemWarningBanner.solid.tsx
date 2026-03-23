/** @jsxImportSource solid-js */

/**
 * Renders amber warning banners for system-level warnings
 * broadcast via WebSocket `system-warning` events.
 *
 * SolidJS port of components/SystemWarningBanner.tsx
 */

import { createEffect, onCleanup, For, Show } from "solid-js";
import {
  systemWarnings,
  dismissSystemWarning,
  backendConnection,
} from "../store";

const AUTO_DISMISS_MS = 20_000;

export function SystemWarningBanner() {
  // Module-level map: lives outside the reactive graph, cleaned up on unmount
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  // Schedule auto-dismiss for each new warning; cancel timers for removed ones
  createEffect(() => {
    const warnings = systemWarnings();

    // Add timers for newly appeared warnings
    for (const message of warnings) {
      if (!timers.has(message)) {
        const timer = setTimeout(() => {
          timers.delete(message);
          dismissSystemWarning(message);
        }, AUTO_DISMISS_MS);
        timers.set(message, timer);
      }
    }

    // Clear timers for warnings that were already dismissed externally
    for (const [msg, timer] of timers) {
      if (!warnings.includes(msg)) {
        clearTimeout(timer);
        timers.delete(msg);
      }
    }
  });

  // Clear all pending timers when the component unmounts
  onCleanup(() => {
    for (const timer of timers.values()) clearTimeout(timer);
    timers.clear();
  });

  const connectionBannerVisible = () => {
    const conn = backendConnection();
    return conn?.state === "reconnecting" || conn?.state === "failed";
  };

  const baseTop = () => (connectionBannerVisible() ? 36 : 0);

  return (
    <Show when={systemWarnings().length > 0}>
      <For each={systemWarnings()}>
        {(message, index) => (
          <div
            class="fixed left-0 right-0 z-[9998] flex items-center justify-between gap-3 bg-amber-500 px-4 py-2 text-[13px] font-medium text-white shadow-lg"
            style={{ top: `${baseTop() + index() * 36}px` }}
          >
            <span class="truncate">{message}</span>
            <button
              type="button"
              onClick={() => dismissSystemWarning(message)}
              class="rounded px-2 py-0.5 text-[12px] text-amber-100 hover:bg-amber-600 transition-colors cursor-pointer shrink-0"
            >
              x
            </button>
          </div>
        )}
      </For>
    </Show>
  );
}
