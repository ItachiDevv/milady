/**
 * StewardAuthBridge — thin wrapper that gates the entire React tree behind
 * an optional StewardProvider when steward is configured server-side.
 *
 * Usage:
 *   <StewardAuthBridge>
 *     <App />
 *   </StewardAuthBridge>
 *
 * When STEWARD_API_URL is NOT set on the server, this component renders
 * its children unchanged — zero overhead, zero behavior change.
 *
 * When steward IS configured, the component:
 *   1. Queries /api/wallet/steward-status to get the steward baseUrl + agentId
 *   2. Creates a browser-side StewardClient pointing at that URL
 *   3. Wraps children in <StewardProvider auth={...}> so sub-components can
 *      call useAuth() / <StewardLogin /> without their own provider setup
 *   4. After every auth event, syncs the JWT token to milady's API client
 *      via client.setToken() so authenticated requests include the bearer
 */

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
  type ReactNode,
} from "react";
import { client } from "../../api/client";

// ── Types ────────────────────────────────────────────────────────────────────

export interface StewardAuthState {
  /** True when steward is configured on the server. */
  stewardConfigured: boolean;
  /** True while the initial steward-status check is in-flight. */
  loading: boolean;
  /** Wallet address from the steward session (if user is authenticated). */
  walletAddress: string | null;
  /** True when the user is authenticated via Steward. */
  isAuthenticated: boolean;
  /** Sign out of the steward session. */
  signOut: () => void;
}

// ── Context ──────────────────────────────────────────────────────────────────

const StewardAuthStateContext = createContext<StewardAuthState>({
  stewardConfigured: false,
  loading: true,
  walletAddress: null,
  isAuthenticated: false,
  signOut: () => {},
});

/**
 * Hook to access Steward auth state.
 * Safe to call outside of StewardAuthBridge — returns sane defaults when
 * steward is not configured.
 */
export function useStewardAuth(): StewardAuthState {
  return useContext(StewardAuthStateContext);
}

// ── Internal: reads from @stwd/react and syncs to milady client ──────────────

function StewardAuthSyncer({
  agentId,
  onStateChange,
}: {
  agentId: string;
  onStateChange: (state: Pick<StewardAuthState, "walletAddress" | "isAuthenticated" | "signOut">) => void;
}) {
  const auth = useAuth();
  const onStateChangeRef = useRef(onStateChange);
  onStateChangeRef.current = onStateChange;

  useEffect(() => {
    // Derive the EVM address from the session if available
    const walletAddress =
      (auth.session as { evmAddress?: string } | null)?.evmAddress ??
      (auth.user as { address?: string; evmAddress?: string } | null)?.address ??
      (auth.user as { address?: string; evmAddress?: string } | null)?.evmAddress ??
      null;

    onStateChangeRef.current({
      isAuthenticated: auth.isAuthenticated,
      walletAddress,
      signOut: auth.signOut,
    });

    // Sync JWT token to milady API client so authed requests work
    if (auth.isAuthenticated) {
      const token = auth.getToken();
      if (token) {
        client.setToken(token);
      }
    } else {
      // Don't clear the milady token when logging out of steward —
      // milady may have its own token (pairing key, API key, etc.)
    }
  }, [
    auth.isAuthenticated,
    auth.session,
    auth.user,
    auth.getToken,
    auth.signOut,
  ]);

  return null;
}

// ── Inner bridge (knows steward is configured) ───────────────────────────────

interface InnerBridgeProps {
  children: ReactNode;
  baseUrl: string;
  agentId: string;
}

function InnerBridge({ children, baseUrl, agentId }: InnerBridgeProps) {
  const sdkClient = useMemo(
    () => new StewardClient({ baseUrl }),
    [baseUrl],
  );

  const [authState, setAuthState] = useState<
    Pick<StewardAuthState, "walletAddress" | "isAuthenticated" | "signOut">
  >({
    walletAddress: null,
    isAuthenticated: false,
    signOut: () => {},
  });

  const handleStateChange = useCallback(
    (
      state: Pick<
        StewardAuthState,
        "walletAddress" | "isAuthenticated" | "signOut"
      >,
    ) => {
      setAuthState(state);
    },
    [],
  );

  const contextValue = useMemo<StewardAuthState>(
    () => ({
      stewardConfigured: true,
      loading: false,
      ...authState,
    }),
    [authState],
  );

  return (
    <StewardAuthStateContext.Provider value={contextValue}>
      <StewardProvider
        client={sdkClient}
        agentId={agentId}
        auth={{ baseUrl }}
      >
        <StewardAuthSyncer agentId={agentId} onStateChange={handleStateChange} />
        {children}
      </StewardProvider>
    </StewardAuthStateContext.Provider>
  );
}

// ── Public component ─────────────────────────────────────────────────────────

interface StewardAuthBridgeProps {
  children: ReactNode;
}

const NOT_CONFIGURED_STATE: StewardAuthState = {
  stewardConfigured: false,
  loading: false,
  walletAddress: null,
  isAuthenticated: false,
  signOut: () => {},
};

/**
 * StewardAuthBridge — place this near the root of the React tree.
 * Safe to render unconditionally; when steward is not configured it's a
 * transparent pass-through.
 */
export function StewardAuthBridge({ children }: StewardAuthBridgeProps) {
  const [loading, setLoading] = useState(true);
  const [bridgeConfig, setBridgeConfig] = useState<{
    baseUrl: string;
    agentId: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSteward() {
      try {
        const status = await client.getStewardStatus();
        if (cancelled) return;

        if (status.configured && status.baseUrl && status.agentId) {
          setBridgeConfig({
            baseUrl: status.baseUrl,
            agentId: status.agentId,
          });
        }
      } catch {
        // Steward not available — silently degrade
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void checkSteward();
    return () => {
      cancelled = true;
    };
  }, []);

  // While loading, expose a loading state but still render children
  if (loading) {
    const loadingState: StewardAuthState = {
      stewardConfigured: false,
      loading: true,
      walletAddress: null,
      isAuthenticated: false,
      signOut: () => {},
    };
    return (
      <StewardAuthStateContext.Provider value={loadingState}>
        {children}
      </StewardAuthStateContext.Provider>
    );
  }

  if (!bridgeConfig) {
    return (
      <StewardAuthStateContext.Provider value={NOT_CONFIGURED_STATE}>
        {children}
      </StewardAuthStateContext.Provider>
    );
  }

  return (
    <InnerBridge baseUrl={bridgeConfig.baseUrl} agentId={bridgeConfig.agentId}>
      {children}
    </InnerBridge>
  );
}
