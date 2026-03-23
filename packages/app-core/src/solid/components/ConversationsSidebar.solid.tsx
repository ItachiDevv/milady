/** @jsxImportSource solid-js */

/**
 * Conversations sidebar — SolidJS port of components/ConversationsSidebar.tsx
 *
 * Handler props are passed in rather than pulled from context so this
 * component remains self-contained and testable.
 */

import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { conversations, activeConversationId } from "../store";
import { ConversationListItem } from "./ConversationListItem.solid";
import { getLocalizedConversationTitle } from "../../components/conversations/conversation-utils";

// Inline English strings — no i18n layer needed in the SolidJS port.
function t(key: string): string {
  const strings: Record<string, string> = {
    "conversations.chats": "Chats",
    "conversations.closePanel": "Close",
    "bugreportmodal.Times": "×",
    "conversations.newChat": "New Chat",
    "conversations.none": "No conversations yet.",
    "conversations.rename": "Rename",
    "conversations.delete": "Delete",
  };
  return strings[key] ?? key;
}

type ConversationsSidebarVariant = "default" | "game-modal";

interface ConversationsSidebarProps {
  mobile?: boolean;
  onClose?: () => void;
  variant?: ConversationsSidebarVariant;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => Promise<void>;
  onRenameConversation: (id: string, title: string) => Promise<void>;
}

export function ConversationsSidebar(props: ConversationsSidebarProps) {
  // Local edit / delete state
  const [editingId, setEditingId] = createSignal<string | null>(null);
  const [editingTitle, setEditingTitle] = createSignal("");
  const [confirmDeleteId, setConfirmDeleteId] = createSignal<string | null>(null);
  const [deletingId, setDeletingId] = createSignal<string | null>(null);
  const [menuConversation, setMenuConversation] = createSignal<{
    id: string;
    title: string;
  } | null>(null);
  const [menuPosition, setMenuPosition] = createSignal({ x: 0, y: 0 });
  const [menuOpen, setMenuOpen] = createSignal(false);

  // inputRef for the inline rename input
  let inputRef: HTMLInputElement | undefined;

  // Focus + select the rename input whenever editingId changes to a truthy value
  createEffect(() => {
    const id = editingId();
    if (id && inputRef) {
      inputRef.focus();
      inputRef.select();
    }
  });

  // Conversations sorted newest-first
  const sortedConversations = createMemo(() =>
    [...conversations].sort((a, b) => {
      const aTime = new Date(a.updatedAt).getTime();
      const bTime = new Date(b.updatedAt).getTime();
      return bTime - aTime;
    }),
  );

  const isGameModal = () => (props.variant ?? "default") === "game-modal";

  // ── Context menu helpers ───────────────────────────────────────────

  const openActionsMenu = (
    event: MouseEvent | TouchEvent,
    conv: { id: string; title: string },
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setConfirmDeleteId(null);
    setMenuConversation(conv);
    setMenuOpen(true);

    if ("touches" in event) {
      const touch =
        (event as TouchEvent).touches[0] ??
        (event as TouchEvent).changedTouches[0];
      setMenuPosition({ x: touch?.clientX ?? 0, y: touch?.clientY ?? 0 });
      return;
    }
    setMenuPosition({
      x: (event as MouseEvent).clientX,
      y: (event as MouseEvent).clientY,
    });
  };

  const closeMenu = () => {
    setMenuConversation(null);
    setMenuOpen(false);
  };

  // ── Rename helpers ─────────────────────────────────────────────────

  const handleStartEdit = (conv: { id: string; title: string }) => {
    setConfirmDeleteId(null);
    closeMenu();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const handleEditSubmit = async (id: string) => {
    const trimmed = editingTitle().trim();
    const original = conversations.find((c) => c.id === id)?.title;
    if (trimmed && trimmed !== original) {
      await props.onRenameConversation(id, trimmed);
    }
    setEditingId(null);
    setEditingTitle("");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const handleEditKeyDown = (e: KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleEditSubmit(id);
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleEditCancel();
    }
  };

  // ── Delete helpers ─────────────────────────────────────────────────

  const handleConfirmDelete = async (id: string) => {
    if (deletingId()) return;
    setDeletingId(id);
    try {
      await props.onDeleteConversation(id);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId((current) => (current === id ? null : current));
    }
  };

  // ── Sidebar classes ────────────────────────────────────────────────

  const asideClass = () =>
    isGameModal()
      ? "flex flex-col h-full bg-black/20 backdrop-blur-md"
      : `${
          props.mobile
            ? "w-full min-w-0 h-full"
            : "w-48 min-w-48 xl:w-60 xl:min-w-60 border-r"
        } border-border bg-bg flex flex-col overflow-y-auto text-[13px]`;

  return (
    <aside
      class={asideClass()}
      data-no-window-drag=""
      data-testid="conversations-sidebar"
      data-variant={props.variant ?? "default"}
      onPointerDown={closeMenu}
    >
      {/* ── Floating context menu (plain HTML) ──────────────────── */}
      <Show when={menuOpen() && menuConversation() !== null}>
        {/* Backdrop captures outside clicks */}
        <div
          class="fixed inset-0 z-40"
          onClick={closeMenu}
          onContextMenu={(e) => {
            e.preventDefault();
            closeMenu();
          }}
        />
        <div
          class="fixed z-50 w-40 rounded-md border border-border bg-card shadow-md py-1 text-[13px]"
          style={{
            left: `${menuPosition().x}px`,
            top: `${menuPosition().y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            data-testid="conv-menu-edit"
            class="w-full px-3 py-1.5 text-left hover:bg-bg-hover transition-colors"
            onClick={() => {
              const mc = menuConversation();
              if (!mc) return;
              handleStartEdit(mc);
            }}
          >
            {t("conversations.rename")}
          </button>
          <button
            type="button"
            data-testid="conv-menu-delete"
            class="w-full px-3 py-1.5 text-left text-danger hover:bg-bg-hover transition-colors"
            onClick={() => {
              const mc = menuConversation();
              if (!mc) return;
              setEditingId(null);
              setEditingTitle("");
              setConfirmDeleteId(mc.id);
              closeMenu();
            }}
          >
            {t("conversations.delete")}
          </button>
        </div>
      </Show>

      {/* ── Mobile header ────────────────────────────────────────── */}
      <Show when={!isGameModal() && props.mobile}>
        <div class="px-3 py-2 border-b border-border flex items-center justify-between">
          <div class="text-xs uppercase tracking-wide text-muted">
            {t("conversations.chats")}
          </div>
          <button
            type="button"
            class="inline-flex items-center justify-center w-7 h-7 border border-border bg-card text-sm text-muted cursor-pointer hover:border-accent hover:text-txt transition-colors"
            onClick={props.onClose}
            aria-label={t("conversations.closePanel")}
          >
            {t("bugreportmodal.Times")}
          </button>
        </div>
      </Show>

      {/* ── New conversation button ───────────────────────────────── */}
      <div
        class={
          isGameModal()
            ? "p-3 border-b border-white/10 shrink-0"
            : "p-3 border-b border-border"
        }
      >
        <button
          type="button"
          class={
            isGameModal()
              ? "w-full py-2 px-3 rounded-lg border border-accent/60 bg-accent/10 text-txt font-medium text-sm transition-all hover:bg-accent/20 hover:border-accent hover:shadow-[0_0_15px_rgba(240,178,50,0.15)] active:scale-[0.98]"
              : "w-full px-3 py-1.5 border border-accent rounded-md bg-transparent text-txt text-[12px] font-medium cursor-pointer transition-colors hover:bg-accent hover:text-accent-fg"
          }
          onClick={() => {
            props.onNewConversation();
            props.onClose?.();
          }}
        >
          {t("conversations.newChat")}
        </button>
      </div>

      {/* ── Conversation list ─────────────────────────────────────── */}
      <div
        class={
          isGameModal()
            ? "flex-1 overflow-y-auto p-2 space-y-1 min-h-0 custom-scrollbar w-full"
            : "flex-1 overflow-y-auto py-1 w-full min-w-0"
        }
      >
        <Show
          when={sortedConversations().length > 0}
          fallback={
            <div
              class={
                isGameModal()
                  ? "py-8 text-center text-white/40 text-sm font-medium italic"
                  : "px-3 py-6 text-center text-muted text-xs"
              }
            >
              {t("conversations.none")}
            </div>
          }
        >
          <For each={sortedConversations()}>
            {(conv) => (
              <ConversationListItem
                conv={conv}
                isActive={conv.id === activeConversationId()}
                isEditing={editingId() === conv.id}
                isUnread={false}
                isGameModal={isGameModal()}
                editingTitle={editingTitle()}
                confirmDeleteId={confirmDeleteId()}
                deletingId={deletingId()}
                mobile={props.mobile ?? false}
                onSelect={(id) => {
                  setConfirmDeleteId(null);
                  closeMenu();
                  props.onSelectConversation(id);
                  props.onClose?.();
                }}
                onEditingTitleChange={setEditingTitle}
                onEditSubmit={(id) => void handleEditSubmit(id)}
                onEditKeyDown={handleEditKeyDown}
                onConfirmDelete={(id) => void handleConfirmDelete(id)}
                onCancelDelete={() => setConfirmDeleteId(null)}
                onOpenActions={openActionsMenu}
              />
            )}
          </For>
        </Show>
      </div>
    </aside>
  );
}
