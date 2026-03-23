/** @jsxImportSource solid-js */

import { createSignal, Show } from "solid-js";
import { isElectrobunRuntime } from "../../bridge/electrobun-runtime";
import {
  pendingRestart,
  pendingRestartReasons,
  restartBannerDismissed,
  dismissRestartBanner,
  triggerRestart,
} from "../store";

export function RestartBanner() {
  const [restarting, setRestarting] = createSignal(false);

  async function handleRestart() {
    setRestarting(true);
    try {
      await triggerRestart();
    } finally {
      setRestarting(false);
    }
  }

  return (
    <Show when={pendingRestart() && !restartBannerDismissed()}>
      <div
        class="fixed left-0 right-0 z-[9998] flex items-center justify-between gap-3 px-4 py-2 text-[13px] font-medium shadow-lg"
        style={{
          top: `${isElectrobunRuntime() ? 40 : 0}px`,
          background: "color-mix(in srgb, var(--accent) 15%, var(--bg) 85%)",
          "border-bottom": "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
          display: "flex",
          color: "var(--text)",
        }}
      >
        <span class="truncate">
          {pendingRestartReasons().length === 1
            ? `${pendingRestartReasons()[0]} - restart to apply.`
            : pendingRestartReasons().length > 1
              ? `${pendingRestartReasons().length} changes pending - restart to apply.`
              : "Restart required to apply changes."}
        </span>
        <div class="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={dismissRestartBanner}
            class="rounded px-3 py-1 text-[12px] transition-colors"
            style={{ color: "var(--muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            Later
          </button>
          <button
            type="button"
            onClick={handleRestart}
            disabled={restarting()}
            class="rounded px-3 py-1 text-[12px] font-semibold transition-colors disabled:opacity-60"
            style={{ background: "#f0b232", color: "#000" }}
          >
            {restarting() ? "Restarting..." : "Restart Now"}
          </button>
        </div>
      </div>
    </Show>
  );
}
