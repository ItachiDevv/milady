/** @jsxImportSource solid-js */

/**
 * SolidJS port of packages/app-core/src/components/Header.tsx
 *
 * Reads reactive state directly from the signals store — no React context,
 * no useApp(), no re-render cascades. Only the DOM nodes bound to a signal
 * update when that signal changes.
 */

import { createEffect, createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import type { JSX } from "solid-js";
import { getTabGroups, type TabGroup } from "../../navigation";
import {
  tab,
  setTab,
  agentStatus,
  connected,
  uiShellMode,
  switchUiShellMode,
  conversations,
  unreadConversations,
  activeConversationId,
  plugins,
  elizaCloudConnected,
  elizaCloudCredits,
  elizaCloudCreditsLow,
  elizaCloudCreditsCritical,
  uiTheme,
  setUiTheme,
  uiLanguage,
  setUiLanguage,
  chatAgentVoiceMuted,
  setChatAgentVoiceMuted,
  setChatMode,
} from "../store";

// ── Constants ──────────────────────────────────────────────────────────

const HEADER_BUTTON_STYLE: JSX.CSSProperties = {
  "clip-path": "none",
  "-webkit-clip-path": "none",
  "touch-action": "manipulation",
};

const HEADER_ICON_BUTTON_CLASS =
  "inline-flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] border border-border/50 bg-bg/50 backdrop-blur-md cursor-pointer text-sm leading-none hover:border-accent hover:text-txt font-medium hover:-translate-y-0.5 transition-all duration-300 hover:shadow-[0_0_15px_rgba(var(--accent),0.5)] active:scale-95 rounded-xl text-txt shadow-sm";

const NAV_LABELS: Record<string, string> = {
  Chat: "Chat",
  Companion: "Companion",
  Stream: "Stream",
  Character: "Character",
  Wallets: "Wallets",
  Knowledge: "Knowledge",
  Connectors: "Connectors",
  Apps: "Apps",
  Settings: "Settings",
  Heartbeats: "Heartbeats",
  Advanced: "Advanced",
};

// ── Inline SVG icons (TODO: replace with real SVG assets) ──────────────

/** TODO: replace with real Menu SVG */
function IconMenu(props: { class?: string }) {
  return (
    <svg
      class={props.class}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {/* TODO: Menu icon lines */}
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

/** TODO: replace with real CircleDollarSign SVG */
function IconCircleDollarSign(props: { class?: string }) {
  return (
    <svg
      class={props.class}
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {/* TODO: CircleDollarSign icon paths */}
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v12M9 9.5c0-1.38 1.12-2.5 3-2.5s3 1.12 3 2.5-1.12 2.5-3 2.5-3 1.12-3 2.5 1.12 2.5 3 2.5 3-1.12 3-2.5" />
    </svg>
  );
}

/** TODO: replace with real UserRound SVG */
function IconUserRound(props: { class?: string }) {
  return (
    <svg
      class={props.class}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {/* TODO: UserRound icon paths */}
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}

/** TODO: replace with real PencilLine SVG */
function IconPencilLine(props: { class?: string }) {
  return (
    <svg
      class={props.class}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {/* TODO: PencilLine icon paths */}
      <path d="M12 20h9" />
      <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 19.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
    </svg>
  );
}

/** TODO: replace with real Monitor SVG */
function IconMonitor(props: { class?: string }) {
  return (
    <svg
      class={props.class}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {/* TODO: Monitor icon paths */}
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

/** TODO: replace with real Volume2 SVG */
function IconVolume2(props: { class?: string }) {
  return (
    <svg
      class={props.class}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {/* TODO: Volume2 icon paths */}
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

/** TODO: replace with real VolumeX SVG */
function IconVolumeX(props: { class?: string }) {
  return (
    <svg
      class={props.class}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {/* TODO: VolumeX icon paths */}
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </svg>
  );
}

/** TODO: replace with real MessageCirclePlus SVG */
function IconMessageCirclePlus(props: { class?: string }) {
  return (
    <svg
      class={props.class}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {/* TODO: MessageCirclePlus icon paths */}
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

// ── Shell view toggle ─────────────────────────────────────────────────

type ShellView = "companion" | "character" | "desktop";

const SHELL_OPTIONS: Array<{ view: ShellView; label: string; icon: () => JSX.Element }> = [
  {
    view: "companion",
    label: "Companion mode",
    icon: () => <IconUserRound class="pointer-events-none h-4 w-4" />,
  },
  {
    view: "character",
    label: "Character editor",
    icon: () => <IconPencilLine class="pointer-events-none h-4 w-4" />,
  },
  {
    view: "desktop",
    label: "Desktop mode",
    icon: () => <IconMonitor class="pointer-events-none h-4 w-4" />,
  },
];

function ShellViewToggle(props: {
  activeView: ShellView;
  onViewChange: (view: ShellView) => void;
}) {
  return (
    <div class="flex shrink-0 items-center">
      <fieldset
        class="inline-flex items-center gap-0.5 rounded-xl border border-border/60 bg-transparent p-0.5 shadow-sm dark:border-border dark:bg-transparent"
        data-testid="ui-shell-toggle"
        data-no-camera-drag="true"
        aria-label="Switch shell view"
      >
        <legend class="sr-only">Switch shell view</legend>
        <For each={SHELL_OPTIONS}>
          {(opt, index) => {
            const selected = () => props.activeView === opt.view;
            const edgeClass =
              index() === 0
                ? "rounded-l-xl rounded-r-none"
                : index() === SHELL_OPTIONS.length - 1
                  ? "rounded-l-none rounded-r-xl"
                  : "rounded-none";
            return (
              <button
                type="button"
                onClick={() => props.onViewChange(opt.view)}
                onPointerDown={(e) => e.stopPropagation()}
                class={`inline-flex h-11 min-h-[44px] min-w-[44px] items-center justify-center px-3 transition-all duration-200 ${edgeClass} ${
                  selected()
                    ? "border border-[#d8a108]/30 bg-bg/55 text-[#8a6500] shadow-sm dark:border-accent/25 dark:bg-bg/85 dark:text-[#f0b232]"
                    : "border border-transparent bg-transparent text-muted-strong hover:border-border/70 hover:bg-bg/85 hover:text-txt dark:text-muted dark:hover:border-border/60 dark:hover:bg-bg-hover/80 dark:hover:text-txt"
                }`}
                style={HEADER_BUTTON_STYLE}
                aria-label={opt.label}
                aria-pressed={selected()}
                title={opt.label}
                data-testid={`ui-shell-toggle-${opt.view}`}
              >
                {opt.icon()}
              </button>
            );
          }}
        </For>
      </fieldset>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────

interface HeaderProps {
  mobileLeft?: JSX.Element;
  transparent?: boolean;
  hideCloudCredits?: boolean;
  /** Called when user requests a new conversation */
  onNewConversation?: () => void;
  /** Called when cloud billing section should open */
  onOpenCloudBilling?: () => void;
}

// ── Main component ────────────────────────────────────────────────────

export function Header(props: HeaderProps) {
  const transparent = () => props.transparent ?? false;
  const hideCloudCredits = () => props.hideCloudCredits ?? false;

  const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);

  // Close mobile menu on Escape
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") setMobileMenuOpen(false);
  };
  window.addEventListener("keydown", handleKeyDown);
  onCleanup(() => window.removeEventListener("keydown", handleKeyDown));

  // Derived: is streaming plugin enabled?
  const streamingEnabled = createMemo(() =>
    plugins.some((p) => p.id === "streaming-base" && p.enabled),
  );

  const tabGroups = createMemo(() => getTabGroups(streamingEnabled()));

  // Derived: which shell view is active
  const activeShellView = createMemo<ShellView>(() => {
    const currentTab = tab();
    const mode = uiShellMode();
    if (currentTab === "character" || currentTab === "character-select") return "character";
    return mode === "companion" ? "companion" : "desktop";
  });

  const useMinimalHeaderChrome = createMemo(
    () => transparent() || activeShellView() !== "desktop",
  );
  const showNavigationMenu = createMemo(() => activeShellView() === "desktop");
  const showCloudCredits = createMemo(
    () => activeShellView() === "desktop" && !hideCloudCredits(),
  );
  const showCloudCreditsStatus = createMemo(() => showCloudCredits() && elizaCloudConnected());

  const creditColor = createMemo(() =>
    elizaCloudCreditsCritical()
      ? "border-danger text-danger bg-danger/10"
      : elizaCloudCreditsLow()
        ? "border-warn text-warn bg-warn/10"
        : "border-ok text-ok bg-ok/10",
  );

  const cloudCreditsDisplay = createMemo(() => {
    const credits = elizaCloudCredits();
    return credits === null ? "Connected" : `$${credits.toFixed(2)}`;
  });

  // When in native/desktop shell mode, ensure power chat mode
  createEffect(() => {
    const view = activeShellView();
    if (view === "desktop") {
      setChatMode("power");
    }
  });

  // Close mobile menu when navigation becomes hidden
  createEffect(() => {
    if (!showNavigationMenu()) {
      setMobileMenuOpen(false);
    }
  });

  const handleShellViewChange = (view: ShellView) => {
    if (view === "companion") {
      switchUiShellMode("companion");
    } else if (view === "character") {
      setTab("character");
    } else {
      switchUiShellMode("native");
    }
  };

  const openCloudBilling = () => {
    props.onOpenCloudBilling?.();
    setMobileMenuOpen(false);
  };

  // ── Cloud credits sub-renderers ──────────────────────────────────

  const CloudCreditsDesktop = () => (
    <Show when={showCloudCreditsStatus()}>
      <button
        type="button"
        data-testid="header-cloud-credits-desktop"
        class={`hidden shrink-0 items-center gap-1.5 px-2.5 py-1.5 h-11 border rounded-md font-mono text-[11px] sm:text-xs no-underline transition-all duration-200 hover:border-accent hover:text-txt hover:shadow-sm sm:inline-flex ${elizaCloudCredits() === null ? "border-muted text-muted" : creditColor()}`}
        title="Cloud credits balance"
        onClick={openCloudBilling}
        style={HEADER_BUTTON_STYLE}
      >
        <IconCircleDollarSign class="pointer-events-none w-3.5 h-3.5" />
        {cloudCreditsDisplay()}
      </button>
    </Show>
  );

  const CloudCreditsMobile = () => (
    <Show when={showCloudCreditsStatus()}>
      <button
        type="button"
        data-testid="header-cloud-credits-mobile"
        class={`flex w-full items-center justify-between gap-3 px-3 py-3 border rounded-xl text-left no-underline transition-all duration-200 hover:border-accent hover:text-txt ${elizaCloudCredits() === null ? "border-muted text-muted" : creditColor()}`}
        title="Cloud credits balance"
        onClick={openCloudBilling}
        style={HEADER_BUTTON_STYLE}
      >
        <span class="flex min-w-0 items-center gap-3">
          <IconCircleDollarSign class="h-4 w-4 shrink-0" />
          <span class="flex min-w-0 flex-col">
            <span class="truncate text-sm font-medium font-sans text-txt">Cloud</span>
            <span class="truncate text-xs font-sans text-muted">Cloud credits balance</span>
          </span>
        </span>
        <span class="shrink-0 font-mono text-sm">{cloudCreditsDisplay()}</span>
      </button>
    </Show>
  );

  // ── Companion header controls (voice + new chat) ──────────────────

  const showCompanionControls = createMemo(
    () => activeShellView() === "companion" || activeShellView() === "character",
  );

  const CompanionControls = () => (
    <Show when={showCompanionControls()}>
      <div
        class="flex items-center justify-center"
        data-testid="companion-header-chat-controls"
        data-no-camera-drag="true"
      >
        <div class="inline-flex items-center gap-2">
          <button
            type="button"
            aria-label={chatAgentVoiceMuted() ? "Agent voice off" : "Agent voice on"}
            aria-pressed={!chatAgentVoiceMuted()}
            title={chatAgentVoiceMuted() ? "Agent voice off" : "Agent voice on"}
            class={`${HEADER_ICON_BUTTON_CLASS} sm:!w-auto sm:gap-1.5 sm:px-3.5`}
            onClick={() => setChatAgentVoiceMuted(!chatAgentVoiceMuted())}
            style={HEADER_BUTTON_STYLE}
          >
            <Show
              when={chatAgentVoiceMuted()}
              fallback={<IconVolume2 class="pointer-events-none h-4 w-4 shrink-0" />}
            >
              <IconVolumeX class="pointer-events-none h-4 w-4 shrink-0" />
            </Show>
            <span class="pointer-events-none hidden sm:inline">Voice</span>
          </button>
          <button
            type="button"
            aria-label="New chat"
            title="New chat"
            class={`${HEADER_ICON_BUTTON_CLASS} sm:!w-auto sm:gap-1.5 sm:px-3.5`}
            onClick={() => props.onNewConversation?.()}
            style={HEADER_BUTTON_STYLE}
          >
            <IconMessageCirclePlus class="pointer-events-none h-4 w-4 shrink-0" />
            <span class="pointer-events-none hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>
    </Show>
  );

  // ── Nav tab buttons ───────────────────────────────────────────────

  const NavTabButton = (groupProps: { group: TabGroup; onClick?: () => void }) => {
    const primaryTab = () => groupProps.group.tabs[0];
    const isActive = () => groupProps.group.tabs.includes(tab());
    return (
      <button
        type="button"
        data-testid={`header-nav-button-${primaryTab()}`}
        class={`relative z-10 inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-0 xl:gap-1.5 shrink-0 px-3 md:px-3.5 xl:px-4 py-2.5 text-[12px] bg-transparent border border-transparent cursor-pointer transition-all duration-300 rounded-full ${
          isActive()
            ? "text-accent font-bold bg-accent/15 shadow-[0_0_15px_rgba(var(--accent),0.18)] border-accent/40 ring-1 ring-inset ring-accent/20"
            : "text-muted hover:text-txt hover:bg-bg-hover hover:border-border/50"
        }`}
        onClick={() => {
          setTab(primaryTab());
          groupProps.onClick?.();
        }}
        title={groupProps.group.description}
        style={HEADER_BUTTON_STYLE}
      >
        {/* Icon: shown on mobile/xl, hidden on md */}
        <span
          data-testid={`header-nav-icon-${primaryTab()}`}
          class="pointer-events-none inline-flex md:hidden xl:inline-flex"
        >
          {/* TODO: render group icon — LucideIcon not available in SolidJS; replace with inline SVG per icon */}
        </span>
        <span
          data-testid={`header-nav-label-${primaryTab()}`}
          class="pointer-events-none hidden md:inline"
        >
          {NAV_LABELS[groupProps.group.label] ?? groupProps.group.label}
        </span>
      </button>
    );
  };

  // ── Render ────────────────────────────────────────────────────────

  return (
    <>
      <header
        class={`py-2 px-3 sm:py-3 sm:px-4 z-20 sticky top-0 w-full transition-all select-none ${
          useMinimalHeaderChrome()
            ? "border-b border-transparent bg-transparent backdrop-blur-0 shadow-none"
            : "border-b border-border/50 bg-bg/80 backdrop-blur-xl"
        }`}
        style={{ "-webkit-user-select": "none", "user-select": "none" }}
      >
        {/* Header bar */}
        <div class="flex min-w-0 items-center w-full" data-no-camera-drag="true">
          {/* Left: shell view toggle */}
          <ShellViewToggle
            activeView={activeShellView()}
            onViewChange={handleShellViewChange}
          />

          {/* Center: nav or companion controls */}
          <div class="flex-1 min-w-0">
            <Show when={showCompanionControls()} fallback={
              <>
                <Show when={props.mobileLeft}>
                  <div class="flex sm:hidden">{props.mobileLeft}</div>
                </Show>
                <Show when={showNavigationMenu()}>
                  <nav class="hidden sm:flex flex-1 items-center justify-start gap-1 overflow-x-auto whitespace-nowrap px-2 sm:pl-4 scrollbar-hide">
                    <For each={tabGroups()}>
                      {(group) => <NavTabButton group={group} />}
                    </For>
                  </nav>
                </Show>
              </>
            }>
              <CompanionControls />
            </Show>
          </div>

          {/* Right: controls */}
          <div
            class="flex shrink-0 items-center justify-end gap-2"
            data-testid="shell-header-right-controls"
            data-no-camera-drag="true"
          >
            <CloudCreditsDesktop />

            {/* Language dropdown placeholder — TODO: port LanguageDropdown to SolidJS */}
            <div
              class={`shrink-0 ${showNavigationMenu() ? "hidden sm:inline-flex" : ""}`}
              data-testid={showNavigationMenu() ? "header-language-dropdown-desktop" : undefined}
              data-no-camera-drag="true"
            >
              {/* TODO: inline SolidJS LanguageDropdown */}
            </div>

            {/* Theme toggle placeholder — TODO: port ThemeToggle to SolidJS */}
            <div
              class={`shrink-0 ${showNavigationMenu() ? "hidden sm:flex" : ""}`}
              data-testid={showNavigationMenu() ? "header-theme-toggle-desktop" : undefined}
              data-no-camera-drag="true"
            >
              {/* TODO: inline SolidJS ThemeToggle */}
            </div>

            {/* Mobile menu trigger — only in desktop nav view */}
            <Show when={showNavigationMenu()}>
              <button
                type="button"
                class={`sm:hidden ${HEADER_ICON_BUTTON_CLASS}`}
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen()}
                style={HEADER_BUTTON_STYLE}
              >
                <IconMenu class="pointer-events-none w-5 h-5" />
              </button>
            </Show>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <Show when={showNavigationMenu() && mobileMenuOpen()}>
        <div
          class="fixed inset-0 z-[140] sm:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <button
            type="button"
            class="absolute inset-0 bg-black/30 backdrop-blur-sm w-full h-full border-0 cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
            style={HEADER_BUTTON_STYLE}
          />

          {/* Menu Panel */}
          <div class="absolute right-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-bg border-l border-border shadow-2xl animate-in slide-in-from-right duration-200 flex flex-col">
            <div class="flex flex-1 flex-col py-3 px-3">
              <div class="flex-1 overflow-y-auto">
                <div class="flex flex-col gap-1">
                  <For each={tabGroups()}>
                    {(group, index) => {
                      const primaryTab = () => group.tabs[0];
                      const isActive = () => group.tabs.includes(tab());
                      return (
                        <button
                          type="button"
                          class={`w-full flex items-center gap-3 px-3 py-3.5 border rounded-xl text-[14px] font-medium transition-all duration-300 cursor-pointer min-h-[48px] ${
                            isActive()
                              ? "border-accent/40 bg-accent/15 text-accent shadow-[0_0_15px_rgba(var(--accent),0.18)] ring-1 ring-inset ring-accent/20"
                              : "border-transparent bg-transparent text-txt hover:border-border/50 hover:bg-bg-hover"
                          }`}
                          style={{
                            ...HEADER_BUTTON_STYLE,
                            "animation-delay": `${index() * 50}ms`,
                          }}
                          onClick={() => {
                            setTab(primaryTab());
                            setMobileMenuOpen(false);
                          }}
                        >
                          <span
                            class={`pointer-events-none w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                              isActive() ? "bg-accent/20" : "bg-bg-accent"
                            }`}
                          >
                            {/* TODO: render group.icon as inline SVG — LucideIcon not available in SolidJS */}
                          </span>
                          <div class="pointer-events-none flex-1 text-left">
                            <div class="font-medium">
                              {NAV_LABELS[group.label] ?? group.label}
                            </div>
                            <Show when={group.description}>
                              <div class="text-[11px] text-muted mt-0.5">
                                {group.description}
                              </div>
                            </Show>
                          </div>
                        </button>
                      );
                    }}
                  </For>
                </div>
              </div>

              {/* Mobile menu footer */}
              <div class="mt-3 flex flex-col gap-3 border-t border-border/50 pt-3">
                <CloudCreditsMobile />
                <div class="flex items-center justify-end gap-2">
                  {/* TODO: inline SolidJS LanguageDropdown */}
                  <div data-testid="header-language-dropdown-mobile" class="shrink-0">
                    {/* TODO: port LanguageDropdown to SolidJS */}
                  </div>
                  {/* TODO: inline SolidJS ThemeToggle */}
                  <div data-testid="header-theme-toggle-mobile" class="flex items-center justify-end">
                    {/* TODO: port ThemeToggle to SolidJS */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
}
