# React → SolidJS Migration Plan

## Architecture

```
apps/app/src/main.tsx          → SolidJS entry (render from solid-js/web)
packages/app-core/src/solid/   → All SolidJS code lives here
  store.ts                     → Signal-based state (replaces AppContext)
  bridge.ts                    → React↔Solid interop during migration
  SolidIsland.tsx              → Mount Solid inside React (hybrid phase)
  App.solid.tsx                → Root app component
  components/                  → Converted components
```

## Conversion Order (by dependency depth)

### Phase 1: Core infrastructure ✅
- [x] store.ts — signals for all state domains
- [x] bridge.ts — useSolidSignal for React interop
- [x] SolidIsland.tsx — mount Solid in React tree
- [x] Vite dual-compiler config

### Phase 2: Leaf components (no children, no useApp)
- [ ] ChatMessage
- [ ] TypingIndicator
- [ ] ConversationListItem
- [ ] ChatAvatar
- [ ] AvatarSelector
- [ ] ConfigSaveFooter
- [ ] SystemWarningBanner
- [ ] RestartBanner
- [ ] ConnectionFailedBanner
- [ ] ShortcutsOverlay

### Phase 3: Chat components
- [ ] ChatComposer (ChatInput)
- [ ] MessageList / MessageContent
- [ ] ConversationsSidebar
- [ ] ChatView
- [ ] ChatModalView

### Phase 4: Companion shell
- [ ] CompanionHeader
- [ ] CompanionView
- [ ] CompanionShell
- [ ] CompanionSceneHost (VRM — complex)

### Phase 5: Navigation + Layout
- [ ] Header
- [ ] ViewRouter
- [ ] App (root)
- [ ] TabScrollView / TabContentView

### Phase 6: Settings & Config
- [ ] SettingsView + sub-sections
- [ ] ConfigPageView
- [ ] ProviderSwitcher
- [ ] MediaSettingsSection
- [ ] VoiceConfigView
- [ ] CodingAgentSettingsSection

### Phase 7: Feature views
- [ ] PluginsView / SkillsView
- [ ] KnowledgeView
- [ ] HeartbeatsView
- [ ] CharacterEditor
- [ ] InventoryView
- [ ] LogsView / RuntimeView
- [ ] DatabaseView / VectorBrowserView
- [ ] FineTuningView / TrajectoriesView
- [ ] StreamView + overlays

### Phase 8: Onboarding
- [ ] OnboardingWizard + steps
- [ ] ConnectionStep sub-screens
- [ ] CloudOnboarding

### Phase 9: Cleanup
- [ ] Remove React dependencies
- [ ] Remove AppContext.tsx (7000 lines)
- [ ] Remove all context providers
- [ ] Remove bridge.ts
- [ ] Update main.tsx entry point

## Conversion Rules

1. Files named `*.solid.tsx` use `/** @jsxImportSource solid-js */`
2. `useState` → `createSignal` (or import from store.ts)
3. `useEffect` → `createEffect` / `onMount` / `onCleanup`
4. `useCallback` → plain functions (stable by default in Solid)
5. `useMemo` → `createMemo`
6. `useRef` → plain `let` variable
7. `{condition && <Comp />}` → `<Show when={condition}><Comp /></Show>`
8. `{arr.map(...)}` → `<For each={arr}>{(item) => ...}</For>`
9. `className` → `class`
10. `onChange` → `onInput` (for inputs)
11. Props are accessed as `props.x`, not destructured at function level
12. No dependency arrays — reactivity is automatic
