/** @jsxImportSource solid-js */

/**
 * Keyboard shortcuts reference overlay (Shift+? to open).
 * SolidJS port of components/ShortcutsOverlay.tsx
 */

import { createSignal, createEffect, onCleanup, For, Show } from "solid-js";
import { COMMON_SHORTCUTS } from "../../hooks/useKeyboardShortcuts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatKey(shortcut: (typeof COMMON_SHORTCUTS)[number]): string {
  const isMac =
    typeof navigator !== "undefined" && navigator.platform?.includes("Mac");
  const parts: string[] = [];
  if (shortcut.ctrl) {
    parts.push(isMac ? "\u2318" : "Ctrl");
  }
  if (shortcut.shift) {
    parts.push(isMac ? "\u21E7" : "Shift");
  }
  if (shortcut.alt) {
    parts.push(isMac ? "\u2325" : "Alt");
  }
  if (shortcut.meta) {
    parts.push(isMac ? "\u2318" : "Win");
  }
  parts.push(
    shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key,
  );
  return parts.join(isMac ? "" : "+");
}

function groupShortcuts(): Record<string, typeof COMMON_SHORTCUTS> {
  const grouped: Record<string, typeof COMMON_SHORTCUTS> = {};
  for (const shortcut of COMMON_SHORTCUTS) {
    const scope = shortcut.scope ?? "global";
    if (!grouped[scope]) {
      grouped[scope] = [];
    }
    grouped[scope].push(shortcut);
  }
  return grouped;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ShortcutsOverlay() {
  const [open, setOpen] = createSignal(false);

  createEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === "?") {
        const tag = (event.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
          return;
        }
        event.preventDefault();
        setOpen((v) => !v);
      }
      if (event.key === "Escape" && open()) {
        event.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    onCleanup(() => window.removeEventListener("keydown", handler));
  });

  return (
    <Show when={open()}>
      <div
        class="fixed inset-0 z-[10000] flex items-center justify-center"
        style={{
          background: "color-mix(in srgb, var(--bg) 50%, transparent)",
          "backdrop-filter": "blur(4px)",
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setOpen(false);
          }
        }}
        onKeyDown={(event) => {
          if (
            event.target === event.currentTarget &&
            (event.key === "Enter" || event.key === " ")
          ) {
            event.preventDefault();
            setOpen(false);
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard Shortcuts"
        tabIndex={-1}
      >
        <div
          class="rounded-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
          style={{
            background: "color-mix(in srgb, var(--bg) 96%, transparent)",
            border: "1px solid color-mix(in srgb, var(--accent) 18%, transparent)",
            "backdrop-filter": "blur(24px)",
            "box-shadow": "var(--shadow-lg)",
          }}
        >
          {/* Header */}
          <div
            class="flex items-center justify-between px-5 py-4"
            style={{ "border-bottom": "1px solid var(--border)" }}
          >
            <h2 class="text-base font-bold" style={{ color: "var(--text)" }}>
              Keyboard Shortcuts
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              class="p-1 rounded transition-colors"
              style={{ color: "var(--muted)" }}
              aria-label="Close"
            >
              {/* X icon */}
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Shortcut groups */}
          <div class="p-5 space-y-5">
            <For each={Object.entries(groupShortcuts())}>
              {([scope, shortcuts]) => (
                <div>
                  <h3
                    class="text-[11px] uppercase tracking-wide font-medium mb-2"
                    style={{ color: "var(--muted)" }}
                  >
                    {scope}
                  </h3>
                  <div class="space-y-1">
                    <For each={shortcuts}>
                      {(shortcut) => (
                        <div
                          class="flex items-center justify-between py-1.5 px-2 rounded"
                        >
                          <span class="text-sm" style={{ color: "var(--text)" }}>
                            {shortcut.description}
                          </span>
                          <kbd
                            class="inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-mono rounded"
                            style={{
                              background: "var(--bg-hover)",
                              border: "1px solid var(--border)",
                              color: "var(--muted)",
                            }}
                          >
                            {formatKey(shortcut)}
                          </kbd>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </Show>
  );
}
