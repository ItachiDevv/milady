import type { AgentSource } from "../../lib/AgentProvider";
import type { AgentStatus } from "../../lib/cloud-api";
import { formatUptime } from "../../lib/format";

interface ConnectorHealth {
  [key: string]: string;
}

interface AgentCardProps {
  agent: AgentStatus;
  source: AgentSource;
  connectorHealth?: ConnectorHealth;
  detailsId?: string;
  sourceUrl?: string;
  webUiUrl?: string;
  nodeId?: string;
  lastHeartbeat?: string;
  billing?: {
    plan?: string;
    costPerHour?: number;
    totalCost?: number;
    currency?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  region?: string;
  tokens?: { used: number; limit: number };
  onPlay: () => void;
  onResume: () => void;
  onPause: () => void;
  onStop: () => void;
  onSelect: () => void;
  onOpenUI?: () => void;
  selected: boolean;
  busy?: boolean;
}

const STATE_CONFIG: Record<
  string,
  {
    dot: string;
    color: string;
    label: string;
    accent: string;
    muted: boolean;
    pulse: boolean;
  }
> = {
  running: {
    dot: "bg-emerald-500",
    color: "text-emerald-400",
    label: "live",
    accent: "border-l-emerald-500",
    muted: false,
    pulse: true,
  },
  paused: {
    dot: "bg-brand",
    color: "text-brand",
    label: "paused",
    accent: "border-l-brand",
    muted: false,
    pulse: false,
  },
  stopped: {
    dot: "bg-text-muted/50",
    color: "text-text-subtle",
    label: "stopped",
    accent: "border-l-text-muted/30",
    muted: true,
    pulse: false,
  },
  provisioning: {
    dot: "bg-brand",
    color: "text-brand",
    label: "provisioning\u2026",
    accent: "border-l-brand",
    muted: false,
    pulse: true,
  },
  unknown: {
    dot: "bg-text-muted/40",
    color: "text-text-muted",
    label: "offline",
    accent: "border-l-text-muted/20",
    muted: true,
    pulse: false,
  },
};

const SOURCE_ICON: Record<string, string> = {
  cloud: "\u2601",
  local: "\u25C9",
  remote: "\u2B21",
};

const SOURCE_LABEL: Record<string, string> = {
  cloud: "cloud",
  local: "local",
  remote: "remote",
};

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

function stopProp(handler: () => void) {
  return (e: React.MouseEvent) => {
    e.stopPropagation();
    handler();
  };
}

function PlayIcon() {
  return (
    <svg
      aria-hidden="true"
      className="w-3 h-3"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.16-5.18a1 1 0 0 0 0-1.68L9.54 5.98A1 1 0 0 0 8 6.82Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="w-3 h-3"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M7 5.5A1.5 1.5 0 0 1 8.5 4h1A1.5 1.5 0 0 1 11 5.5v13A1.5 1.5 0 0 1 9.5 20h-1A1.5 1.5 0 0 1 7 18.5v-13Zm6 0A1.5 1.5 0 0 1 14.5 4h1A1.5 1.5 0 0 1 17 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-1A1.5 1.5 0 0 1 13 18.5v-13Z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg
      aria-hidden="true"
      className="w-3 h-3"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
    </svg>
  );
}

export function AgentCard({
  agent,
  source,
  connectorHealth,
  detailsId,
  sourceUrl,
  webUiUrl,
  nodeId,
  lastHeartbeat,
  billing,
  createdAt,
  updatedAt,
  region,
  tokens,
  onPlay,
  onResume,
  onPause,
  onStop,
  onSelect,
  onOpenUI,
  selected,
  busy = false,
}: AgentCardProps) {
  const cfg = STATE_CONFIG[agent.state] ?? STATE_CONFIG.unknown;
  const canOpenUI = agent.state === "running" || source === "cloud";
  const uiUrl = webUiUrl || sourceUrl;
  const isLive = agent.state === "running";
  const isStopped = agent.state === "stopped" || agent.state === "unknown";

  // Hero datum: uptime when running, state label otherwise
  const heroValue = isLive ? (agent.uptime ? formatUptime(agent.uptime) : "\u2014") : cfg.label;
  const heroLabel = isLive ? "uptime" : "status";

  // Build supporting facts — what matters operationally
  const facts: string[] = [];
  if (agent.model && agent.model !== "\u2014") facts.push(agent.model);
  if (billing?.costPerHour !== undefined)
    facts.push(`$${billing.costPerHour.toFixed(2)}/hr`);
  const hb = formatRelativeTime(lastHeartbeat);
  if (hb) facts.push(`heartbeat ${hb}`);
  if (agent.memories !== undefined) facts.push(`${agent.memories} memories`);
  if (createdAt && !isLive) facts.push(`created ${formatRelativeTime(createdAt)}`);

  return (
    <article
      className={`group relative border-l-2 transition-all duration-200
        ${cfg.accent}
        ${isStopped ? "opacity-60 hover:opacity-80" : "opacity-100"}
        ${selected ? "ring-1 ring-brand/50" : "hover:ring-1 hover:ring-border"}`}
    >
      <div
        className={`border border-border border-l-0 ${selected ? "border-brand/30 bg-surface" : "bg-surface"}`}
      >
        {/* Clickable identity area */}
        <button
          type="button"
          aria-expanded={selected}
          aria-controls={detailsId}
          aria-label={`Open details for ${agent.agentName}`}
          onClick={onSelect}
          className="block w-full text-left p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
        >
          {/* Identity row: status dot + name + source tag */}
          <div className="flex items-center gap-2.5 mb-3">
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}
                ${cfg.pulse ? "animate-[status-pulse_2s_ease-in-out_infinite]" : ""}`}
            />
            <h3 className="text-[15px] font-medium text-text-light truncate leading-tight">
              {agent.agentName}
            </h3>
            <span
              className="text-[10px] font-mono text-text-subtle tracking-wide flex-shrink-0"
              title={source}
            >
              {SOURCE_ICON[source]} {SOURCE_LABEL[source]}
            </span>
          </div>

          {/* Hero datum */}
          <div className="mb-2">
            <span
              className={`text-2xl font-mono tabular-nums tracking-tight ${isLive ? "text-text-light" : cfg.color}`}
            >
              {heroValue}
            </span>
            <span className="text-[10px] font-mono text-text-subtle ml-2 tracking-wide">
              {heroLabel}
            </span>
          </div>

          {/* Supporting facts — inline, not boxes */}
          {facts.length > 0 && (
            <p className="text-xs text-text-muted font-mono truncate">
              {facts.join(" \u00B7 ")}
            </p>
          )}

          {/* Connector health dots */}
          {connectorHealth && Object.keys(connectorHealth).length > 0 && (
            <div className="flex items-center gap-3 mt-2">
              {Object.entries(connectorHealth).map(([name, status]) => (
                <span
                  key={name}
                  className="flex items-center gap-1 font-mono text-[10px] text-text-muted"
                >
                  {name}
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      status === "ok"
                        ? "bg-emerald-500"
                        : status === "configured"
                          ? "bg-amber-500"
                          : "bg-text-muted/40"
                    }`}
                  />
                </span>
              ))}
            </div>
          )}
        </button>

        {/* Actions — tight row, primary + text secondaries */}
        <div className="flex items-center gap-3 px-4 pb-3 pt-0">
          {/* Primary action */}
          {agent.state === "running" && canOpenUI && uiUrl ? (
            <button
              type="button"
              onClick={stopProp(() => {
                if (onOpenUI) {
                  onOpenUI();
                } else if (uiUrl) {
                  window.open(uiUrl, "_blank", "noopener,noreferrer");
                }
              })}
              aria-label={`Open ${agent.agentName} UI`}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5
                bg-brand text-dark font-mono text-[11px] font-semibold tracking-wide
                transition-colors hover:bg-brand-hover
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand
                disabled:cursor-not-allowed disabled:opacity-60"
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
          ) : agent.state === "stopped" ? (
            <button
              type="button"
              onClick={stopProp(onPlay)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5
                bg-emerald-500/10 text-emerald-400 font-mono text-[11px] font-medium
                transition-colors hover:bg-emerald-500/20
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
                disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PlayIcon />
              Start
            </button>
          ) : agent.state === "paused" ? (
            <button
              type="button"
              onClick={stopProp(onResume)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5
                bg-emerald-500/10 text-emerald-400 font-mono text-[11px] font-medium
                transition-colors hover:bg-emerald-500/20
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
                disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PlayIcon />
              Resume
            </button>
          ) : null}

          {/* Secondary text actions */}
          <div className="flex items-center gap-2 ml-auto">
            {agent.state === "running" && (
              <button
                type="button"
                onClick={stopProp(onPause)}
                disabled={busy}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-text-muted
                  hover:text-brand transition-colors
                  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand
                  disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PauseIcon />
                Pause
              </button>
            )}
            {agent.state !== "stopped" &&
              agent.state !== "provisioning" &&
              agent.state !== "unknown" && (
                <button
                  type="button"
                  onClick={stopProp(onStop)}
                  disabled={busy}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-text-muted
                    hover:text-red-400 transition-colors
                    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400
                    disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <StopIcon />
                  Stop
                </button>
              )}
            {(agent.state === "provisioning" || busy) && (
              <span className="text-[11px] font-mono text-brand animate-pulse">
                {busy ? "working\u2026" : "starting\u2026"}
              </span>
            )}
          </div>
        </div>

        {/* Collapsed details when selected */}
        {selected && (nodeId || region || createdAt) && (
          <div className="px-4 py-2.5 border-t border-border-subtle">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-text-subtle">
              {nodeId && <span>node: {nodeId}</span>}
              {region && <span>region: {region.toLowerCase()}</span>}
              {createdAt && (
                <span>created: {formatRelativeTime(createdAt)}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
