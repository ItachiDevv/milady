/** @jsxImportSource solid-js */

/**
 * Conversation list item with inline edit, delete confirm, long-press.
 * SolidJS port of components/conversations/ConversationListItem.tsx
 */

import { Show } from "solid-js";
import { getLocalizedConversationTitle } from "../../components/conversations/conversation-utils";

interface ConversationListItemProps {
  conv: { id: string; title: string; updatedAt: string };
  isActive: boolean;
  isEditing: boolean;
  isUnread: boolean;
  isGameModal: boolean;
  editingTitle: string;
  confirmDeleteId: string | null;
  deletingId: string | null;
  mobile: boolean;
  onSelect: (id: string) => void;
  onEditingTitleChange: (value: string) => void;
  onEditSubmit: (id: string) => void;
  onEditKeyDown: (e: KeyboardEvent, id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
  onOpenActions: (
    event: MouseEvent | TouchEvent,
    conv: { id: string; title: string },
  ) => void;
}

// Identity t() — inline English strings, no i18n needed in solid port.
function t(key: string): string {
  const strings: Record<string, string> = {
    "conversations.deleteConfirm": "Delete?",
    "conversations.deleteYes": "Yes",
    "conversations.deleteNo": "No",
  };
  return strings[key] ?? key;
}

export function ConversationListItem(props: ConversationListItemProps) {
  let longPressTimer: number | null = null;
  let suppressClick = false;

  const clearLongPressTimer = () => {
    if (longPressTimer !== null) {
      window.clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  };

  const handleTouchStart = (event: TouchEvent) => {
    if (!props.mobile) return;
    clearLongPressTimer();
    longPressTimer = window.setTimeout(() => {
      suppressClick = true;
      props.onOpenActions(event, props.conv);
      clearLongPressTimer();
    }, 450);
  };

  const handleTouchEnd = () => {
    clearLongPressTimer();
  };

  const outerClass = () =>
    `w-full ${
      props.isGameModal
        ? "group relative flex items-start gap-3 w-full p-2.5 rounded-xl cursor-pointer transition-all border border-transparent"
        : "flex items-center pl-3 pr-2 py-2 gap-1 cursor-pointer transition-colors border-l-[3px]"
    } ${
      props.isActive
        ? props.isGameModal
          ? "bg-accent/15 border-accent/30 shadow-[0_0_15px_rgba(240,178,50,0.1)]"
          : "bg-bg-hover border-l-accent"
        : props.isGameModal
          ? "hover:bg-white/5 hover:border-white/10"
          : "border-l-transparent hover:bg-bg-hover"
    }`;

  const selectButtonClass = () =>
    props.isGameModal
      ? "flex w-full flex-col flex-1 min-w-0 items-start justify-start text-left cursor-pointer h-auto p-0 rounded-none bg-transparent border-none"
      : "flex items-center gap-2 flex-1 min-w-0 bg-transparent border-0 p-0 m-0 text-left h-auto cursor-pointer rounded-none";

  const titleClass = () =>
    props.isGameModal
      ? `block w-full text-[13px] font-medium truncate leading-tight text-left transition-colors min-w-0 ${props.isActive ? "text-txt text-shadow-glow" : "text-white/90 group-hover:text-white"}`
      : "block w-full font-medium truncate text-left text-txt min-w-0";

  return (
    <div
      data-testid="conv-item"
      data-active={props.isActive || undefined}
      class={outerClass()}
    >
      <Show
        when={props.isEditing}
        fallback={
          <>
            <button
              type="button"
              data-testid="conv-select"
              class={selectButtonClass()}
              onClick={() => {
                if (suppressClick) {
                  suppressClick = false;
                  return;
                }
                props.onSelect(props.conv.id);
              }}
              onContextMenu={(event) => {
                if (props.mobile) return;
                props.onOpenActions(event, props.conv);
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              onTouchMove={handleTouchEnd}
            >
              <Show when={props.isUnread}>
                <span
                  class={
                    props.isGameModal
                      ? "absolute top-3 left-3 w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(240,178,50,0.8)]"
                      : "w-2 h-2 rounded-full bg-accent shrink-0"
                  }
                />
              </Show>

              <span class={titleClass()}>
                {getLocalizedConversationTitle(props.conv.title, t)}
              </span>
            </button>

            <Show when={props.confirmDeleteId === props.conv.id}>
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <span class="text-[10px] text-danger">
                  {t("conversations.deleteConfirm")}
                </span>
                <button
                  type="button"
                  class="h-6 px-1.5 py-0.5 text-[10px] text-white bg-danger rounded shadow-sm disabled:opacity-50"
                  onClick={() => void props.onConfirmDelete(props.conv.id)}
                  disabled={props.deletingId === props.conv.id}
                >
                  {props.deletingId === props.conv.id ? "..." : t("conversations.deleteYes")}
                </button>
                <button
                  type="button"
                  class="h-6 px-1.5 py-0.5 text-[10px] text-muted border border-border rounded shadow-sm hover:border-accent hover:text-txt disabled:opacity-50"
                  onClick={() => props.onCancelDelete()}
                  disabled={props.deletingId === props.conv.id}
                >
                  {t("conversations.deleteNo")}
                </button>
              </div>
            </Show>
          </>
        }
      >
        <input
          type="text"
          class="w-full h-8 px-1.5 border-accent bg-card text-txt text-[13px] shadow-sm focus-visible:ring-1 focus-visible:ring-accent"
          value={props.editingTitle}
          onInput={(e) => props.onEditingTitleChange(e.currentTarget.value)}
          onBlur={() => void props.onEditSubmit(props.conv.id)}
          onKeyDown={(e) => props.onEditKeyDown(e, props.conv.id)}
          onClick={(e) => e.stopPropagation()}
        />
      </Show>
    </div>
  );
}
