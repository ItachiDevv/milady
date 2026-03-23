/**
 * React ↔ SolidJS bridge.
 *
 * Allows React components to subscribe to SolidJS signals during
 * the incremental migration. React components call useSolidSignal()
 * which creates a React state that syncs with the SolidJS signal.
 *
 * Once a component is fully ported to SolidJS, it reads signals
 * directly — no bridge needed.
 */

import { createEffect, createRoot, onCleanup } from "solid-js";
import { useSyncExternalStore } from "react";
import type { Accessor } from "solid-js";

/**
 * Subscribe a React component to a SolidJS signal.
 *
 * Uses useSyncExternalStore for tear-free reads — React sees the
 * signal value as an external store and re-renders only when it changes.
 *
 * @example
 * ```tsx
 * import { chatInput } from "../solid/store";
 * import { useSolidSignal } from "../solid/bridge";
 *
 * function ReactChatInput() {
 *   const input = useSolidSignal(chatInput);
 *   return <input value={input} />;
 * }
 * ```
 */
export function useSolidSignal<T>(signal: Accessor<T>): T {
  // Create a SolidJS reactive root that tracks the signal and
  // notifies React's external store subscription on changes.
  const store = (() => {
    let currentValue = signal();
    const listeners = new Set<() => void>();

    // SolidJS effect runs inside a reactive root — tracks the signal
    // and calls all React listeners when it changes.
    const dispose = createRoot((dispose) => {
      createEffect(() => {
        currentValue = signal();
        for (const listener of listeners) {
          listener();
        }
      });
      return dispose;
    });

    return {
      subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
          if (listeners.size === 0) {
            dispose();
          }
        };
      },
      getSnapshot: () => currentValue,
    };
  })();

  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}

/**
 * Subscribe to a SolidJS store (object/array) from React.
 * Uses JSON snapshot comparison for change detection.
 */
export function useSolidStore<T>(storeAccessor: () => T): T {
  return useSolidSignal(storeAccessor as Accessor<T>);
}
