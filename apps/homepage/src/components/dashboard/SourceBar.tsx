import { useCallback, useEffect, useRef, useState } from "react";
import { useAgents } from "../../lib/AgentProvider";
import { useAuth } from "../../lib/useAuth";
import { ConnectionModal } from "./ConnectionModal";

/**
 * Ops strip: source filters (left) + actions (right).
 * Always shows all source tabs; dims cloud when unauthenticated.
 */
export function SourceBar() {
  const {
    agents,
    isRefreshing,
    refresh,
    addRemoteUrl,
    sourceFilter,
    setSourceFilter,
  } = useAgents();
  const { isAuthenticated: authed } = useAuth();
  const [showAddRemote, setShowAddRemote] = useState(false);
  const lastSyncRef = useRef<number>(Date.now());
  const [syncAge, setSyncAge] = useState("");

  const handleRefresh = useCallback(async () => {
    await refresh();
    lastSyncRef.current = Date.now();
  }, [refresh]);

  // Update sync-age display every 15s
  useEffect(() => {
    const tick = () => {
      const diff = Math.floor((Date.now() - lastSyncRef.current) / 1000);
      if (diff < 5) setSyncAge("just now");
      else if (diff < 60) setSyncAge(`${diff}s ago`);
      else if (diff < 3600) setSyncAge(`${Math.floor(diff / 60)}m ago`);
      else setSyncAge(`${Math.floor(diff / 3600)}h ago`);
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  // Reset sync age after refresh completes
  useEffect(() => {
    if (!isRefreshing) {
      lastSyncRef.current = Date.now();
      setSyncAge("just now");
    }
  }, [isRefreshing]);

  const cloudCount = agents.filter((a) => a.source === "cloud").length;
  const localCount = agents.filter((a) => a.source === "local").length;
  const remoteCount = agents.filter((a) => a.source === "remote").length;

  // Reset filter if cloud tab selected but not authed
  useEffect(() => {
    if (!authed && sourceFilter === "cloud") {
      setSourceFilter("all");
    }
  }, [authed, sourceFilter, setSourceFilter]);

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 sm:px-5 md:px-8 py-1.5 bg-dark-secondary border-b border-border">
      {/* Source filter cluster */}
      <div className="flex items-center gap-px order-2 md:order-1 overflow-x-auto">
        <FilterTab
          label="all"
          count={agents.length}
          active={sourceFilter === "all"}
          onClick={() => setSourceFilter("all")}
        />
        <FilterTab
          label="local"
          count={localCount}
          active={sourceFilter === "local"}
          onClick={() => setSourceFilter("local")}
          status={localCount > 0 ? "active" : "idle"}
        />
        <FilterTab
          label="cloud"
          count={cloudCount}
          active={sourceFilter === "cloud"}
          onClick={() => authed && setSourceFilter("cloud")}
          status={!authed ? "disabled" : cloudCount > 0 ? "active" : "idle"}
          disabled={!authed}
        />
        <FilterTab
          label="remote"
          count={remoteCount}
          active={sourceFilter === "remote"}
          onClick={() => setSourceFilter("remote")}
          status={remoteCount > 0 ? "active" : "idle"}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 order-1 md:order-2 ml-auto">
        <button
          type="button"
          onClick={() => setShowAddRemote(true)}
          className="font-mono text-[11px] text-text-subtle hover:text-text-light transition-colors"
        >
          + connect
        </button>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 font-mono text-[11px] text-text-subtle hover:text-text-light transition-colors disabled:opacity-40"
        >
          {isRefreshing && (
            <svg
              aria-hidden="true"
              className="w-3 h-3 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          <span>
            {isRefreshing ? "syncing" : `synced ${syncAge}`}
          </span>
        </button>
      </div>

      {showAddRemote && (
        <ConnectionModal
          onSubmit={(data) => {
            addRemoteUrl(data.name, data.url, data.token);
            setShowAddRemote(false);
          }}
          onClose={() => setShowAddRemote(false)}
        />
      )}
    </div>
  );
}

function FilterTab({
  label,
  count,
  active,
  onClick,
  status,
  disabled = false,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  status?: "active" | "idle" | "disabled";
  disabled?: boolean;
}) {
  const dot =
    status === "active"
      ? "bg-emerald-400"
      : status === "disabled"
        ? "bg-text-muted/20"
        : "bg-text-muted/40";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[11px] transition-colors
        ${
          disabled
            ? "text-text-muted/40 cursor-not-allowed"
            : active
              ? "text-text-light"
              : "text-text-muted hover:text-text-light"
        }`}
    >
      {status && (
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      )}
      <span>{label}</span>
      {count > 0 && (
        <span
          className={`tabular-nums ${active ? "text-brand" : "text-text-subtle"}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
