/** @jsxImportSource solid-js */

/**
 * SolidJS message list — prototype.
 *
 * Uses <For> for keyed list rendering. When a new message is added,
 * only the new DOM node is created — existing messages are untouched.
 * When a streaming token updates a message's text, only that message's
 * text node updates — no list re-render.
 */

import { For, Show, createMemo } from "solid-js";
import {
  conversationMessages,
  chatSending,
  chatFirstTokenReceived,
} from "./store";

export function SolidMessageList() {
  // createMemo — only recomputes when conversationMessages changes
  const visibleMessages = createMemo(() =>
    conversationMessages.filter((m) => m.text?.trim()),
  );

  return (
    <div class="flex flex-col gap-3 px-3 py-4 overflow-y-auto flex-1">
      <For each={visibleMessages()} fallback={<EmptyState />}>
        {(msg) => (
          <div
            class={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              class={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-accent/85 text-white rounded-br-sm"
                  : "border border-border bg-card text-txt rounded-bl-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        )}
      </For>

      <Show when={chatSending() && !chatFirstTokenReceived()}>
        <TypingDots />
      </Show>
    </div>
  );
}

function EmptyState() {
  return (
    <div class="flex flex-col items-center justify-center flex-1 text-muted text-sm">
      <p>Start a conversation</p>
    </div>
  );
}

function TypingDots() {
  return (
    <div class="flex items-center gap-1 px-4 py-3">
      <span class="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ "animation-delay": "0ms" }} />
      <span class="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ "animation-delay": "200ms" }} />
      <span class="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ "animation-delay": "400ms" }} />
    </div>
  );
}
