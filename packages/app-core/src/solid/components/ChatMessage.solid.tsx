/** @jsxImportSource solid-js */

/**
 * Enhanced chat message component with actions and better UX.
 * SolidJS port of components/ChatMessage.tsx
 */

import {
  createSignal,
  createEffect,
  createMemo,
  onMount,
  Show,
  type Component,
} from "solid-js";
import type { ConversationMessage } from "../../api";

// TODO: import MessageContent from solid port when available
// For now render message.text directly

interface ChatMessageProps {
  message: ConversationMessage;
  isGrouped?: boolean;
  agentName?: string;
  agentAvatarSrc?: string | null;
  onCopy?: (text: string) => void;
  onSpeak?: (messageId: string, text: string) => void;
  onEdit?: (messageId: string, text: string) => Promise<boolean> | boolean;
  onDelete?: (messageId: string) => void;
}

// TODO: lucide-solid is not installed. Using inline SVGs for icons.
// Replace with lucide-solid imports once `lucide-solid` is added to dependencies.

function IconCopy(props: { class?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class={props.class}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function IconCheck(props: { class?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class={props.class}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconVolume2(props: { class?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class={props.class}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function IconPencil(props: { class?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class={props.class}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function IconTrash2(props: { class?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class={props.class}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

export function ChatMessage(props: ChatMessageProps) {
  const [copied, setCopied] = createSignal(false);
  const [showActions, setShowActions] = createSignal(false);
  const [supportsHover, setSupportsHover] = createSignal(
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(hover: hover) and (pointer: fine)").matches
      : true,
  );
  const [isEditing, setIsEditing] = createSignal(false);
  const [draftText, setDraftText] = createSignal(props.message.text);
  const [savingEdit, setSavingEdit] = createSignal(false);

  let articleRef: HTMLElement | undefined;
  let editTextareaRef: HTMLTextAreaElement | undefined;

  const isUser = createMemo(() => props.message.role === "user");
  const canEdit = createMemo(
    () =>
      isUser() &&
      typeof props.onEdit === "function" &&
      props.message.source !== "local_command" &&
      !props.message.id.startsWith("temp-"),
  );
  const canPlay = createMemo(
    () => !isUser() && typeof props.onSpeak === "function" && !!props.message.text.trim(),
  );

  const handleCopy = () => {
    if (props.onCopy) {
      props.onCopy(props.message.text);
    } else {
      void navigator.clipboard.writeText(props.message.text);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEditing = () => {
    if (!canEdit() || savingEdit()) return;
    setDraftText(props.message.text);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    if (savingEdit()) return;
    setDraftText(props.message.text);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!props.onEdit) return;
    const nextText = draftText().trim();
    if (!nextText) return;
    if (nextText === props.message.text.trim()) {
      setDraftText(props.message.text);
      setIsEditing(false);
      return;
    }

    setSavingEdit(true);
    try {
      const saved = await props.onEdit(props.message.id, nextText);
      if (saved !== false) {
        setIsEditing(false);
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const handleTapReveal = (event: TouchEvent) => {
    if (supportsHover() || isEditing()) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("button, a, textarea, input")) {
      return;
    }
    setShowActions((prev) => !prev);
  };

  const handleEditKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      handleCancelEditing();
      return;
    }
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void handleSaveEdit();
    }
  };

  // Sync draft text and focus textarea when editing state changes
  createEffect(() => {
    if (!isEditing()) {
      setDraftText(props.message.text);
      return;
    }
    const textarea = editTextareaRef;
    if (!textarea) return;
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  });

  // Sync hover capability with media query changes
  onMount(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const syncSupportsHover = () => {
      setSupportsHover(mediaQuery.matches);
      if (mediaQuery.matches) {
        setShowActions(false);
      }
    };
    syncSupportsHover();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncSupportsHover);
      return () => mediaQuery.removeEventListener("change", syncSupportsHover);
    }

    mediaQuery.addListener(syncSupportsHover);
    return () => mediaQuery.removeListener(syncSupportsHover);
  });

  // Dismiss actions on outside tap (touch devices)
  createEffect(() => {
    if (supportsHover() || !showActions() || typeof document === "undefined") {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        setShowActions(false);
        return;
      }
      if (!articleRef?.contains(target)) {
        setShowActions(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  });

  const agentName = () => props.agentName ?? "Agent";

  return (
    <article
      ref={articleRef}
      class={`flex items-start gap-2 sm:gap-3 ${isUser() ? "justify-end" : "justify-start"} ${props.isGrouped ? "mt-1" : "mt-4"}`}
      data-testid="chat-message"
      data-role={props.message.role}
      onMouseEnter={supportsHover() ? () => setShowActions(true) : undefined}
      onMouseLeave={supportsHover() ? () => setShowActions(false) : undefined}
      onTouchEnd={handleTapReveal}
      aria-label={`${isUser() ? "Your" : agentName()} message`}
    >
      {/* Message Bubble */}
      <div class={`max-w-[88%] sm:max-w-[80%] min-w-0 ${isUser() ? "mr-1" : ""}`}>
        {/* Message Content */}
        <div
          class={`relative group px-4 py-2.5 text-[15px] leading-[1.7] whitespace-pre-wrap break-words rounded-2xl ${
            isUser()
              ? "bg-accent text-accent-fg rounded-br-md"
              : "bg-bg-accent border border-border text-txt rounded-bl-md"
          }`}
          style={{ "font-family": "var(--font-chat)" }}
        >
          <Show
            when={isEditing()}
            fallback={
              /* TODO: Replace with <MessageContent message={props.message} /> once a SolidJS port exists */
              <span>{props.message.text}</span>
            }
          >
            <div class="space-y-3">
              <textarea
                ref={editTextareaRef}
                value={draftText()}
                onInput={(event) => setDraftText(event.currentTarget.value)}
                onKeyDown={handleEditKeyDown}
                class="w-full min-h-[110px] rounded-xl border border-white/20 bg-black/10 px-3 py-2 text-[15px] leading-[1.7] text-inherit outline-none focus:border-white/40"
                style={{ "font-family": "var(--font-chat)" }}
                aria-label="Edit message"
                disabled={savingEdit()}
              />
              <div class="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelEditing}
                  disabled={savingEdit()}
                  class="h-8 px-3 text-xs text-inherit/80 hover:bg-black/10 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleSaveEdit()}
                  disabled={
                    savingEdit() ||
                    !draftText().trim() ||
                    draftText().trim() === props.message.text.trim()
                  }
                  class="h-8 px-3 text-xs border border-white/25 bg-black/10 hover:bg-black/15 rounded-md transition-colors"
                >
                  {savingEdit() ? "Saving..." : "Save and resend"}
                </button>
              </div>
            </div>
          </Show>

          {/* Stream interruption indicator */}
          <Show when={!isUser() && props.message.interrupted}>
            <div class="mt-2 pt-2 border-t border-danger/30">
              <span class="text-xs text-danger">Response interrupted</span>
            </div>
          </Show>

          {/* Message Actions */}
          <Show when={!isEditing()}>
            <div
              class={`absolute ${isUser() ? "left-0 -translate-x-full" : "right-0 translate-x-full"} top-0 flex items-center gap-1 p-1 transition-opacity duration-200 ${
                showActions() ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              {/* Copy button */}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleCopy();
                }}
                class="w-7 h-7 rounded-md text-muted hover:text-txt hover:bg-bg-hover transition-colors flex items-center justify-center"
                title={copied() ? "Copied!" : "Copy message"}
                aria-label={copied() ? "Copied to clipboard" : "Copy message"}
              >
                <Show
                  when={copied()}
                  fallback={<IconCopy class="w-3.5 h-3.5" />}
                >
                  <IconCheck class="w-3.5 h-3.5 text-ok" />
                </Show>
              </button>

              {/* Speak button */}
              <Show when={canPlay()}>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    props.onSpeak?.(props.message.id, props.message.text);
                  }}
                  class="w-7 h-7 rounded-md text-muted hover:text-txt hover:bg-bg-hover transition-colors flex items-center justify-center"
                  title="Play message"
                  aria-label="Play message"
                >
                  <IconVolume2 class="w-3.5 h-3.5" />
                </button>
              </Show>

              {/* Edit button */}
              <Show when={canEdit()}>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleStartEditing();
                  }}
                  class="w-7 h-7 rounded-md text-muted hover:text-txt hover:bg-bg-hover transition-colors flex items-center justify-center"
                  title="Edit message"
                  aria-label="Edit message"
                >
                  <IconPencil class="w-3.5 h-3.5" />
                </button>
              </Show>

              {/* Delete button */}
              <Show when={props.onDelete}>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    props.onDelete!(props.message.id);
                  }}
                  class="w-7 h-7 rounded-md text-muted hover:text-danger hover:bg-danger/10 transition-colors flex items-center justify-center"
                  title="Delete message"
                  aria-label="Delete message"
                >
                  <IconTrash2 class="w-3.5 h-3.5" />
                </button>
              </Show>
            </div>
          </Show>
        </div>
      </div>
    </article>
  );
}

/* ── Typing Indicator ────────────────────────────────────────────────── */

export function TypingIndicator(props: {
  agentName: string;
  agentAvatarSrc?: string | null;
}) {
  const agentInitial = () =>
    props.agentName.trim().charAt(0).toUpperCase() || "A";

  return (
    <div class="flex items-start gap-2 sm:gap-3 mt-4">
      <div class="w-8 h-8 shrink-0 rounded-full overflow-hidden border border-border bg-bg-hover shadow-sm">
        <Show
          when={props.agentAvatarSrc}
          fallback={
            <div class="w-full h-full flex items-center justify-center text-[11px] font-bold text-txt bg-accent-subtle">
              {agentInitial()}
            </div>
          }
        >
          <img
            src={props.agentAvatarSrc!}
            alt={`${props.agentName} avatar`}
            class="w-full h-full object-cover"
          />
        </Show>
      </div>

      <div class="max-w-[88%] sm:max-w-[80%] min-w-0">
        <div class="text-[12px] font-semibold text-txt mb-1">
          {props.agentName}
        </div>
        <div class="px-4 py-3 bg-bg-accent border border-border rounded-2xl rounded-bl-md">
          <div class="flex gap-1">
            <span
              class="w-2 h-2 rounded-full bg-muted-strong animate-[typing-bounce_1.2s_ease-in-out_infinite]"
              style={{ "animation-delay": "0ms" }}
            />
            <span
              class="w-2 h-2 rounded-full bg-muted-strong animate-[typing-bounce_1.2s_ease-in-out_infinite]"
              style={{ "animation-delay": "200ms" }}
            />
            <span
              class="w-2 h-2 rounded-full bg-muted-strong animate-[typing-bounce_1.2s_ease-in-out_infinite]"
              style={{ "animation-delay": "400ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
