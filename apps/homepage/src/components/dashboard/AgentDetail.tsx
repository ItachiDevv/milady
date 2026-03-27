import { useCallback, useEffect, useState } from "react";
import type { ManagedAgent } from "../../lib/AgentProvider";
import type { AgentStatus, WalletBalancesResponse } from "../../lib/cloud-api";
import { formatUptime as formatUptimeShared } from "../../lib/format";
import { openWebUI } from "../../lib/open-web-ui";
import { ExportPanel } from "./ExportPanel";
import { LogsPanel } from "./LogsPanel";
import { MetricsPanel } from "./MetricsPanel";

const TABS = ["Overview", "Metrics", "Logs", "Snapshots"] as const;
type Tab = (typeof TABS)[number];

interface AgentDetailProps {
  agent: AgentStatus;
  managedAgent: ManagedAgent;
  connectionId: string;
  webUIUrl?: string;
  onNavigate?: (section: string) => void;
}

function formatUptime(seconds?: number): string {
  return formatUptimeShared(seconds, true);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function formatRelativeTime(isoString?: string): string {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const STATE_COLORS: Record<string, { text: string; bg: string }> = {
  running: { text: "text-emerald-400", bg: "bg-emerald-500" },
  paused: { text: "text-brand", bg: "bg-brand" },
  stopped: { text: "text-red-400", bg: "bg-red-500" },
  provisioning: { text: "text-brand", bg: "bg-brand" },
  unknown: { text: "text-text-muted", bg: "bg-text-muted" },
};

/* ── Types for fetched data ── */

interface FullStatus {
  state?: string;
  agentName?: string;
  model?: string;
  startedAt?: number;
  uptime?: number;
  startup?: { phase?: string; attempt?: number; lastError?: string };
  pendingRestart?: boolean;
  pendingRestartReasons?: string[];
}

interface PluginEntry {
  id: string;
  name: string;
  enabled: boolean;
  isActive?: boolean;
  category?: string;
}

export function AgentDetail({
  agent,
  managedAgent,
  connectionId,
  webUIUrl,
  onNavigate,
}: AgentDetailProps) {
  const [tab, setTab] = useState<Tab>("Overview");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCloudAction = useCallback(
    async (action: string) => {
      if (!managedAgent.cloudClient || !managedAgent.cloudAgentId) return;
      setActionLoading(action);
      setActionError(null);
      try {
        switch (action) {
          case "suspend":
            await managedAgent.cloudClient.suspendAgent(
              managedAgent.cloudAgentId,
            );
            break;
          case "resume":
            await managedAgent.cloudClient.resumeAgent(
              managedAgent.cloudAgentId,
            );
            break;
          case "snapshot":
            await managedAgent.cloudClient.takeSnapshot(
              managedAgent.cloudAgentId,
            );
            break;
          case "delete":
            if (
              window.confirm(
                `Delete agent "${agent.agentName}"? This cannot be undone.`,
              )
            ) {
              await managedAgent.cloudClient.deleteAgent(
                managedAgent.cloudAgentId,
              );
            }
            break;
        }
      } catch (err) {
        setActionError(err instanceof Error ? err.message : String(err));
      } finally {
        setActionLoading(null);
      }
    },
    [managedAgent, agent.agentName],
  );

  const stateColors = STATE_COLORS[agent.state] ?? STATE_COLORS.unknown;

  return (
    <div className="border border-border bg-surface overflow-hidden">
      {/* Compact header: name + status + primary action */}
      <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${stateColors.bg} ${agent.state === "running" ? "animate-[status-pulse_2s_ease-in-out_infinite]" : ""}`}
          />
          <span className="font-mono text-sm font-medium text-text-light truncate">
            {agent.agentName}
          </span>
          <span
            className={`font-mono text-[11px] flex-shrink-0 ${stateColors.text}`}
          >
            {agent.state}
          </span>
        </div>

        {webUIUrl && (
          <button
            type="button"
            onClick={() =>
              openWebUI(
                webUIUrl,
                managedAgent.source,
                managedAgent.cloudAgentId,
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 flex-shrink-0
              bg-brand text-dark font-mono text-[11px] font-semibold tracking-wide
              hover:bg-brand-hover transition-colors"
          >
            open ui
            <svg
              aria-hidden="true"
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex items-center overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setTab(t)}
            className={`relative shrink-0 px-4 py-2.5 font-mono text-[11px] tracking-wide transition-colors
              ${
                tab === t
                  ? "text-text-light"
                  : "text-text-muted hover:text-text-light"
              }`}
          >
            {t.toUpperCase()}
            {tab === t && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-brand" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5">
        {tab === "Overview" && (
          <OverviewTab
            agent={agent}
            managedAgent={managedAgent}
            onAction={handleCloudAction}
            actionLoading={actionLoading}
            actionError={actionError}
            onNavigate={onNavigate}
          />
        )}
        {tab === "Metrics" && <MetricsPanel />}
        {tab === "Logs" && <LogsPanel />}
        {tab === "Snapshots" && <ExportPanel connectionId={connectionId} />}
      </div>
    </div>
  );
}

/** Overview: Bloomberg-density dossier. */
function OverviewTab({
  agent,
  managedAgent,
  onAction,
  actionLoading,
  actionError,
  onNavigate,
}: {
  agent: AgentStatus;
  managedAgent: ManagedAgent;
  onAction: (action: string) => void;
  actionLoading: string | null;
  actionError: string | null;
  onNavigate?: (section: string) => void;
}) {
  const isCloud = managedAgent.source === "cloud";
  const stateColors = STATE_COLORS[agent.state] ?? STATE_COLORS.unknown;
  const connectors = managedAgent.connectorHealth;
  const hasConnectors = connectors && Object.keys(connectors).length > 0;

  // ── Fetched data state ──
  const [fullStatus, setFullStatus] = useState<FullStatus | null>(null);
  const [character, setCharacter] = useState<Record<string, unknown> | null>(
    null,
  );
  const [plugins, setPlugins] = useState<PluginEntry[] | null>(null);
  const [walletTotal, setWalletTotal] = useState<string | null>(null);
  const [pluginsExpanded, setPluginsExpanded] = useState(false);

  // ── Fetch on mount ──
  useEffect(() => {
    const client = managedAgent.client;
    if (!client) return;

    let cancelled = false;

    // Full status
    client
      .getAgentFullStatus()
      .then((data) => {
        if (!cancelled) setFullStatus(data);
      })
      .catch(() => {});

    // Character
    client
      .getAgentCharacter()
      .then((data) => {
        if (!cancelled) setCharacter(data);
      })
      .catch(() => {});

    // Plugins
    client
      .getPlugins()
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setPlugins(data);
      })
      .catch(() => {});

    // Wallet balance (total USD)
    client
      .getWalletBalances()
      .then((data: WalletBalancesResponse) => {
        if (cancelled) return;
        let total = 0;
        if (data.evm) {
          for (const chain of data.evm.chains) {
            total += Number.parseFloat(chain.nativeValueUsd) || 0;
          }
        }
        if (data.solana) {
          total += Number.parseFloat(data.solana.solValueUsd) || 0;
        }
        setWalletTotal(
          `$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [managedAgent.client]);

  // ── Derived data ──
  const charBio = extractBio(character);
  const modelName = fullStatus?.model || agent.model || "—";

  // Health data from /api/health (already in managedAgent via AgentProvider)
  // plus fullStatus for startup errors, pending restart, etc.

  const connectorEntries = connectors ? Object.entries(connectors) : [];
  const activeConnectors = connectorEntries.filter(
    ([, s]) => s === "ok",
  ).length;
  const configuredConnectors = connectorEntries.length;

  const enabledPlugins = plugins?.filter((p) => p.enabled) ?? [];
  const pluginCategories = new Map<string, number>();
  for (const p of enabledPlugins) {
    const cat = p.category || "other";
    pluginCategories.set(cat, (pluginCategories.get(cat) || 0) + 1);
  }

  const walletAddrs = managedAgent.walletAddresses;
  const hasWallet =
    walletAddrs && (walletAddrs.evmAddress || walletAddrs.solanaAddress);

  // Chain labels for wallet
  const walletChains: string[] = [];
  if (walletAddrs?.evmAddress) walletChains.push("evm");
  if (walletAddrs?.solanaAddress) walletChains.push("sol");

  return (
    <div className="space-y-5">
      {/* ── Agent Identity ── */}
      <div>
        <div className="flex items-baseline gap-3 mb-1">
          <span className="font-mono text-base font-semibold text-text-light">
            {agent.agentName}
          </span>
          <span className="font-mono text-[11px] text-text-subtle">
            {modelName}
          </span>
        </div>
        {charBio && (
          <p className="font-mono text-[11px] text-text-muted leading-relaxed max-w-prose">
            {charBio}
          </p>
        )}
      </div>

      {/* ── Health Strip ── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-2 px-3 bg-dark/50 border border-border-subtle">
        {/* State */}
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
          <span
            className={`w-1.5 h-1.5 rounded-full ${stateColors.bg}`}
          />
          <span className={stateColors.text}>{agent.state}</span>
        </span>

        <HealthDivider />

        {/* Model */}
        <span className="font-mono text-[11px] text-text-muted">
          model{" "}
          <span className="text-text-light">{modelName}</span>
        </span>

        <HealthDivider />

        {/* Uptime */}
        <span className="font-mono text-[11px] text-text-muted">
          uptime{" "}
          <span className="text-text-light tabular-nums">
            {agent.uptime ? formatUptime(agent.uptime) : "—"}
          </span>
        </span>

        <HealthDivider />

        {/* Memories */}
        <span className="font-mono text-[11px] text-text-muted">
          memories{" "}
          <span className="text-text-light tabular-nums">
            {agent.memories !== undefined
              ? agent.memories.toLocaleString()
              : "—"}
          </span>
        </span>

        {/* Plugins summary (from health probe or plugins list) */}
        {plugins && (
          <>
            <HealthDivider />
            <span className="font-mono text-[11px] text-text-muted">
              plugins{" "}
              <span className="text-text-light tabular-nums">
                {enabledPlugins.length} loaded
              </span>
            </span>
          </>
        )}

        {/* Source */}
        <HealthDivider />
        <span className="font-mono text-[11px] text-text-muted">
          {managedAgent.source}
        </span>

        {/* Pending restart warning */}
        {fullStatus?.pendingRestart && (
          <>
            <HealthDivider />
            <span className="font-mono text-[11px] text-amber-400">
              ⚠ restart pending
              {fullStatus.pendingRestartReasons?.length
                ? `: ${fullStatus.pendingRestartReasons.join(", ")}`
                : ""}
            </span>
          </>
        )}

        {/* Startup error */}
        {fullStatus?.startup?.lastError && (
          <>
            <HealthDivider />
            <span className="font-mono text-[11px] text-red-400 truncate max-w-xs" title={fullStatus.startup.lastError}>
              err: {fullStatus.startup.lastError}
            </span>
          </>
        )}
      </div>

      {/* ── Connectors ── */}
      {hasConnectors && (
        <Section
          label="connectors"
          badge={`${activeConnectors} active · ${configuredConnectors} configured`}
          onNavigate={onNavigate ? () => onNavigate("connectors") : undefined}
        >
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {connectorEntries.map(([name, status]) => {
              const isOk = status === "ok";
              const dotColor = isOk
                ? "bg-emerald-400"
                : status === "configured"
                  ? "bg-brand"
                  : "bg-text-muted/40";
              return (
                <span
                  key={name}
                  className={`inline-flex items-center gap-1.5 font-mono text-xs ${
                    isOk ? "text-text-light font-medium" : "text-text-muted"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${dotColor}`}
                  />
                  {name}
                </span>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Wallet ── */}
      {hasWallet && (
        <Section
          label="wallet"
          badge={walletChains.join(" + ")}
          onNavigate={onNavigate ? () => onNavigate("wallet") : undefined}
        >
          <div className="space-y-1">
            {walletTotal && (
              <p className="font-mono text-sm tabular-nums text-text-light mb-2">
                {walletTotal}
                <span className="text-[10px] text-text-subtle ml-1.5">
                  total
                </span>
              </p>
            )}
            {walletAddrs?.evmAddress && (
              <AddressRow
                chain="evm"
                address={walletAddrs.evmAddress}
              />
            )}
            {walletAddrs?.solanaAddress && (
              <AddressRow
                chain="sol"
                address={walletAddrs.solanaAddress}
              />
            )}
          </div>
        </Section>
      )}

      {/* ── Plugins ── */}
      {plugins && enabledPlugins.length > 0 && (
        <Section
          label="plugins"
          badge={`${enabledPlugins.length} loaded`}
        >
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {(pluginsExpanded
              ? enabledPlugins
              : enabledPlugins.slice(0, 8)
            ).map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-text-light"
              >
                {p.name}
                {p.category && (
                  <span className="text-[9px] text-text-subtle">
                    {p.category}
                  </span>
                )}
              </span>
            ))}
            {!pluginsExpanded && enabledPlugins.length > 8 && (
              <button
                type="button"
                onClick={() => setPluginsExpanded(true)}
                className="font-mono text-[11px] text-text-subtle hover:text-text-light transition-colors"
              >
                +{enabledPlugins.length - 8} more
              </button>
            )}
            {pluginsExpanded && enabledPlugins.length > 8 && (
              <button
                type="button"
                onClick={() => setPluginsExpanded(false)}
                className="font-mono text-[11px] text-text-subtle hover:text-text-light transition-colors"
              >
                show less
              </button>
            )}
          </div>
          {/* Category summary */}
          {pluginCategories.size > 0 && (
            <p className="font-mono text-[10px] text-text-subtle mt-1.5">
              {Array.from(pluginCategories.entries())
                .map(([cat, count]) => `${count} ${cat}`)
                .join(" · ")}
            </p>
          )}
        </Section>
      )}

      {/* ── Connection ── */}
      <Section label="connection">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
          {managedAgent.sourceUrl && (
            <Datum
              label="endpoint"
              value={managedAgent.sourceUrl}
              truncate
            />
          )}
          {managedAgent.nodeId && (
            <Datum label="node" value={managedAgent.nodeId} />
          )}
          {managedAgent.lastHeartbeat && (
            <Datum
              label="heartbeat"
              value={formatRelativeTime(managedAgent.lastHeartbeat)}
            />
          )}
          {managedAgent.createdAt && (
            <Datum label="created" value={formatDate(managedAgent.createdAt)} />
          )}
          {managedAgent.region && (
            <Datum label="region" value={managedAgent.region} />
          )}
          {fullStatus?.startedAt && (
            <Datum
              label="started"
              value={formatDate(new Date(fullStatus.startedAt).toISOString())}
            />
          )}
        </div>
      </Section>

      {/* ── Billing (cloud only) ── */}
      {isCloud &&
        managedAgent.billing &&
        (managedAgent.billing.costPerHour != null ||
          managedAgent.billing.totalCost != null) && (
          <Section label="billing">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
              {managedAgent.billing.costPerHour != null && (
                <Datum
                  label="rate"
                  value={`$${managedAgent.billing.costPerHour.toFixed(2)}/hr`}
                  accent
                  mono
                />
              )}
              {managedAgent.billing.totalCost != null && (
                <Datum
                  label="total spent"
                  value={`$${managedAgent.billing.totalCost.toFixed(2)}${managedAgent.billing.currency ? ` ${managedAgent.billing.currency}` : ""}`}
                  accent
                  mono
                />
              )}
              {managedAgent.billing.plan && (
                <Datum
                  label="plan"
                  value={managedAgent.billing.plan}
                />
              )}
            </div>
          </Section>
        )}

      {/* ── Actions (cloud only) ── */}
      {isCloud && managedAgent.cloudClient && managedAgent.cloudAgentId && (
        <div className="pt-3 border-t border-border">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {(agent.state === "running" || agent.state === "paused") && (
              <TextAction
                label="suspend"
                action="suspend"
                loading={actionLoading}
                onClick={onAction}
              />
            )}
            {(agent.state === "stopped" || agent.state === "paused") && (
              <TextAction
                label="resume"
                action="resume"
                loading={actionLoading}
                onClick={onAction}
              />
            )}
            <TextAction
              label="snapshot"
              action="snapshot"
              loading={actionLoading}
              onClick={onAction}
            />
            <TextAction
              label="delete"
              action="delete"
              loading={actionLoading}
              onClick={onAction}
              variant="danger"
            />
          </div>
          {actionError && (
            <p className="mt-2 font-mono text-[11px] text-red-400">
              {actionError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Helpers ── */

/** Extract a short bio string from character data. */
function extractBio(char: Record<string, unknown> | null): string | null {
  if (!char) return null;
  // Try common fields: bio, description, system, backstory
  for (const key of ["bio", "description", "system", "backstory"]) {
    const val = char[key];
    if (typeof val === "string" && val.length > 0) {
      return val.length > 200 ? `${val.slice(0, 200)}…` : val;
    }
    if (Array.isArray(val)) {
      const joined = val.filter((v) => typeof v === "string").join(" ");
      if (joined.length > 0) {
        return joined.length > 200 ? `${joined.slice(0, 200)}…` : joined;
      }
    }
  }
  return null;
}

function HealthDivider() {
  return <span className="text-border-subtle select-none">·</span>;
}

/* ── Shared primitives ── */

function Section({
  label,
  badge,
  children,
  onNavigate,
}: {
  label: string;
  badge?: string;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2.5">
        {onNavigate ? (
          <button
            type="button"
            onClick={onNavigate}
            className="font-mono text-[9px] tracking-[0.15em] text-text-subtle hover:text-text-light transition-colors group"
          >
            {label}{" "}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </span>
          </button>
        ) : (
          <p className="font-mono text-[9px] tracking-[0.15em] text-text-subtle">
            {label}
          </p>
        )}
        {badge && (
          <span className="font-mono text-[9px] text-text-muted">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Datum({
  label,
  value,
  mono,
  accent,
  truncate: shouldTruncate,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
  truncate?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[9px] tracking-wider text-text-subtle mb-0.5">
        {label}
      </p>
      <p
        className={`text-xs ${shouldTruncate ? "truncate" : ""} ${
          accent
            ? "text-brand font-mono tabular-nums"
            : mono
              ? "font-mono tabular-nums text-text-light"
              : "text-text-light"
        }`}
        title={shouldTruncate ? value : undefined}
      >
        {value}
      </p>
    </div>
  );
}

function AddressRow({ chain, address }: { chain: string; address: string }) {
  const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] text-text-subtle w-6">
        {chain}
      </span>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(address)}
        title={`Copy: ${address}`}
        className="font-mono text-xs text-text-light hover:text-brand transition-colors"
      >
        {truncated}
      </button>
    </div>
  );
}

/** Text-command-style action link. */
function TextAction({
  label,
  action,
  loading,
  onClick,
  variant = "default",
}: {
  label: string;
  action: string;
  loading: string | null;
  onClick: (action: string) => void;
  variant?: "default" | "danger";
}) {
  const isLoading = loading === action;
  return (
    <button
      type="button"
      onClick={() => onClick(action)}
      disabled={loading !== null}
      className={`font-mono text-[11px] transition-colors disabled:opacity-40
        ${
          variant === "danger"
            ? "text-text-subtle hover:text-red-400"
            : "text-text-subtle hover:text-text-light"
        }`}
    >
      {isLoading ? `${label}…` : label}
    </button>
  );
}
