/**
 * StewardAuthBridge — connects Steward's auth stack to milady's app state.
 *
 * When the backend reports a Steward API URL via the steward-status endpoint,
 * this bridge:
 *   - Creates a StewardClient and StewardProvider from @stwd/react
 *   - Exposes auth state via useStewardAuthBridge() hook
 *   - Calls onTokenChange whenever the user signs in/out
 *
 * Falls back gracefully: if STEWARD_API_URL is not configured, children render
 * without any Steward context and existing flows work exactly as before.
 */

import type { StewardSession } from "@stwd/sdk";
import { StewardClient } from "@stwd/sdk";
import { StewardProvider, useAuth } from "@stwd/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { client } from "../api/client";

// ---------------------------------------------------------------------------
// Context value type
// ---------------------------------------------------------------------------

export interface StewardAuthBridgeValue {
  /** True when the backend has STEWARD_API_URL configured with a valid baseUrl and agentId */
  isConfigured: boolean;
  /** The Steward API base URL, or null when not configured */
  baseUrl: string | null;
  /** The Steward agent ID for this instance, or null when not configured */
  agentId: string | null;
  /** Current Steward auth session, null when not signed in */
  session: StewardSession | null;
  /** True while the initial steward-status check is in flight */
  isLoading: boolean;
}

const DEFAULT_BRIDGE_VALUE: StewardAuthBridgeValue = {
  isConfigured: false,
  baseUrl: null,
  agentId: null,
  session: null,
  isLoading: true,
};

const StewardAuthBridgeContext =
  createContext<StewardAuthBridgeValue>(DEFAULT_BRIDGE_VALUE);

/**
 * Read Steward auth state from anywhere in the component tree.
 * Always safe to call — returns defaults when bridge is not configured.
 */
export function useStewardAuthBridge(): StewardAuthBridgeValue {
  return useContext(StewardAuthBridgeContext);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface StewardAuthBridgeProviderProps {
  children: ReactNode;
  /**
   * Called whenever the Steward JWT changes.
   * Receives the token string on sign-in, null on sign-out.
   * Typically wired to client.setToken() in AppContext.
   */
  onTokenChange?: (token: string | null) => void;
}

/**
 * StewardAuthBridgeProvider — top-level bridge between Steward auth and milady.
 *
 * Place high in the component tree (e.g. inside AppProviderInner) so all
 * onboarding screens and main app views can access Steward auth state via
 * useStewardAuthBridge().
 *
 * Implementation notes:
 * - Fetches steward-status once on mount to discover baseUrl + agentId
 * - When configured, renders <StewardProvider> around children
 * - StewardProvider manages auth state; session changes are forwarded via onTokenChange
 * - Uses localStorage for JWT persistence (survives page reload when configured)
 */
export function StewardAuthBridgeProvider({
  children,
  onTokenChange,
}: StewardAuthBridgeProviderProps) {
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<StewardSession | null>(null);

  // Stable ref so handleSessionChange closure never captures a stale callback
  const onTokenChangeRef = useRef(onTokenChange);
  onTokenChangeRef.current = onTokenChange;

  // Discover Steward config from the backend once on mount
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    client
      .getStewardStatus()
      .then((status) => {
        if (cancelled) return;
        const url = status?.baseUrl?.trim() || null;
        const id = status?.agentId?.trim() || null;
        setBaseUrl(url);
        setAgentId(id);
      })
      .catch(() => {
        // Steward may not be running — silently ignore, keep defaults
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []); // intentionally empty — fetch once per mount

  const handleSessionChange = useCallback(
    (newSession: StewardSession | null) => {
      setSession(newSession);
      onTokenChangeRef.current?.(newSession?.token ?? null);
    },
    [],
  );

  const isConfigured = Boolean(baseUrl && agentId);

  // Memoize the StewardClient so it isn't recreated on every render
  const stewardClient = useMemo(
    () => (baseUrl ? new StewardClient({ baseUrl }) : null),
    [baseUrl],
  );

  const contextValue = useMemo<StewardAuthBridgeValue>(
    () => ({
      isConfigured,
      baseUrl,
      agentId,
      session,
      isLoading,
    }),
    [isConfigured, baseUrl, agentId, session, isLoading],
  );

  // Not configured — render children as-is, existing auth flows unaffected
  if (!isConfigured || !stewardClient || !agentId) {
    return (
      <StewardAuthBridgeContext.Provider value={contextValue}>
        {children}
      </StewardAuthBridgeContext.Provider>
    );
  }

  // Configured — wrap with StewardProvider so StewardLogin and useAuth() work
  return (
    <StewardAuthBridgeContext.Provider value={contextValue}>
      <StewardProvider
        client={stewardClient}
        agentId={agentId}
        auth={{
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          baseUrl: baseUrl!,
          // Persist JWT across page reloads in browser environments
          storage:
            typeof localStorage !== "undefined" ? localStorage : undefined,
        }}
      >
        {/* Inner watcher monitors auth state changes and forwards them up */}
        <StewardSessionWatcher onSessionChange={handleSessionChange} />
        {children}
      </StewardProvider>
    </StewardAuthBridgeContext.Provider>
  );
}

/**
 * StewardSessionWatcher — renderless component that monitors Steward auth state
 * inside a StewardProvider and forwards session changes to the bridge callback.
 */
function StewardSessionWatcher({
  onSessionChange,
}: {
  onSessionChange: (session: StewardSession | null) => void;
}) {
  const { session } = useAuth();
  const onChangeRef = useRef(onSessionChange);
  onChangeRef.current = onSessionChange;

  useEffect(() => {
    onChangeRef.current(session);
  }, [session]);

  return null;
}
