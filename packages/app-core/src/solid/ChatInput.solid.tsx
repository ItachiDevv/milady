/** @jsxImportSource solid-js */

/**
 * SolidJS chat input — prototype.
 *
 * This component runs ONCE. The input value updates the DOM directly
 * via signal binding — no React re-renders, no virtual DOM diffing.
 *
 * When chatInput() changes (keystroke), only the <input> value attribute
 * updates. The rest of the component tree is untouched.
 */

import { Show } from "solid-js";
import {
  chatInput,
  setChatInput,
  chatSending,
} from "./store";

export function SolidChatInput(props: {
  onSend: (text: string) => void;
  placeholder?: string;
}) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const text = chatInput().trim();
      if (text && !chatSending()) {
        props.onSend(text);
        setChatInput("");
      }
    }
  };

  // This JSX runs once. Solid's compiler transforms it into
  // fine-grained DOM operations — no component re-execution.
  return (
    <div class="flex items-center gap-2 p-2 border-t border-border">
      <input
        type="text"
        class="flex-1 bg-transparent text-txt text-sm outline-none placeholder:text-muted"
        placeholder={props.placeholder ?? "Type a message..."}
        value={chatInput()}
        onInput={(e) => setChatInput(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        disabled={chatSending()}
      />
      <Show when={!chatSending()}>
        <button
          type="button"
          class="px-3 py-1.5 text-xs font-medium bg-accent text-accent-fg rounded-lg hover:bg-accent/90 transition-colors"
          onClick={() => {
            const text = chatInput().trim();
            if (text) {
              props.onSend(text);
              setChatInput("");
            }
          }}
        >
          Send
        </button>
      </Show>
      <Show when={chatSending()}>
        <div class="px-3 py-1.5 text-xs text-muted">Sending...</div>
      </Show>
    </div>
  );
}
