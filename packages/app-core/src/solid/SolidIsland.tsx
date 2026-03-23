/**
 * React wrapper that mounts a SolidJS component tree inside a React component.
 *
 * Usage:
 * ```tsx
 * import { SolidIsland } from "../solid/SolidIsland";
 * import { SolidChatInput } from "../solid/ChatInput.solid";
 *
 * function ReactParent() {
 *   return (
 *     <div>
 *       <SolidIsland>
 *         {(mount) => {
 *           const { render } = await import("solid-js/web");
 *           const { SolidChatInput } = await import("./ChatInput.solid");
 *           render(() => <SolidChatInput onSend={handleSend} />, mount);
 *         }}
 *       </SolidIsland>
 *     </div>
 *   );
 * }
 * ```
 */

import { useEffect, useRef } from "react";

interface SolidIslandProps {
  /** Solid render function — receives the mount element */
  render: (mountEl: HTMLDivElement) => (() => void) | void;
  className?: string;
}

/**
 * Mounts a SolidJS component tree inside a React component.
 * Handles cleanup on unmount to prevent memory leaks.
 */
export function SolidIsland({ render, className }: SolidIslandProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const disposeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // Mount the SolidJS tree
    const cleanup = render(el);
    if (typeof cleanup === "function") {
      disposeRef.current = cleanup;
    }

    return () => {
      // Dispose the SolidJS reactive root on unmount
      disposeRef.current?.();
      disposeRef.current = null;
      // Clear the mount point
      if (el) el.innerHTML = "";
    };
  }, [render]);

  return <div ref={mountRef} className={className} />;
}
