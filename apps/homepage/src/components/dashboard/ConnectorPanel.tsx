import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAgents, type ManagedAgent } from "../../lib/AgentProvider";
import type { CloudApiClient } from "../../lib/cloud-api";
import type { DashboardSection } from "./Sidebar";

// ---------------------------------------------------------------------------
// types
// ---------------------------------------------------------------------------

interface PluginParam {
  key: string;
  type?: string;
  description?: string;
  required?: boolean;
  sensitive?: boolean;
  isSet?: boolean;
  currentValue?: unknown;
  default?: unknown;
  options?: string[];
}

interface PluginData {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  isActive?: boolean;
  category?: string;
  parameters?: PluginParam[];
  setupGuideUrl?: string;
  homepage?: string;
  tags?: string[];
}

interface TestResult {
  loading: boolean;
  success?: boolean;
  error?: string;
  message?: string;
  durationMs?: number;
}

// ---------------------------------------------------------------------------
// badge colors per connector id
// ---------------------------------------------------------------------------

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  discord: { bg: "bg-purple-500/20", text: "text-purple-400" },
  telegram: { bg: "bg-blue-500/20", text: "text-blue-400" },
  twitter: { bg: "bg-neutral-500/20", text: "text-neutral-300" },
  slack: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  farcaster: { bg: "bg-violet-500/20", text: "text-violet-400" },
  whatsapp: { bg: "bg-green-500/20", text: "text-green-400" },
  bluesky: { bg: "bg-sky-500/20", text: "text-sky-400" },
  signal: { bg: "bg-blue-600/20", text: "text-blue-300" },
  nostr: { bg: "bg-orange-500/20", text: "text-orange-400" },
  matrix: { bg: "bg-teal-500/20", text: "text-teal-400" },
  msteams: { bg: "bg-indigo-500/20", text: "text-indigo-400" },
};

const DEFAULT_BADGE = { bg: "bg-neutral-500/20", text: "text-neutral-400" };

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function connectorStatus(
  plugin: PluginData,
  healthStatus?: string,
): { label: string; dot: string; textColor: string } {
  if (!plugin.enabled)
    return {
      label: "disabled",
      dot: "bg-neutral-500/40",
      textColor: "text-text-muted",
    };
  if (healthStatus === "ok" || plugin.isActive)
    return {
      label: "connected",
      dot: "bg-emerald-500",
      textColor: "text-emerald-400",
    };

  // check if required params are all set
  const required = plugin.parameters?.filter((p) => p.required) ?? [];
  const setCount = required.filter((p) => p.isSet).length;
  if (required.length > 0 && setCount < required.length)
    return {
      label: "needs config",
      dot: "bg-amber-500",
      textColor: "text-amber-400",
    };
  if (healthStatus === "configured")
    return {
      label: "configured",
      dot: "bg-amber-500",
      textColor: "text-amber-400",
    };
  return {
    label: "enabled",
    dot: "bg-emerald-500/60",
    textColor: "text-emerald-400/70",
  };
}

function configuredCount(params: PluginParam[]): {
  set: number;
  required: number;
} {
  const required = params.filter((p) => p.required);
  const set = required.filter((p) => p.isSet).length;
  return { set, required: required.length };
}

// ---------------------------------------------------------------------------
// ConnectorPanel (public)
// ---------------------------------------------------------------------------

interface ConnectorPanelProps {
  agentId?: string;
  onNavigate?: (section: DashboardSection, agentId?: string) => void;
}

export function ConnectorPanel({ agentId }: ConnectorPanelProps) {
  const { agents } = useAgents();
  const selected = agentId
    ? agents.find((a) => a.id === agentId && a.client)
    : agents.find((a) => a.client);

  if (!selected || !selected.client) {
    return (
      <div className="font-mono text-sm text-text-muted py-8">
        select an agent to view connectors
      </div>
    );
  }

  return <ConnectorPanelInner agent={selected} />;
}

// ---------------------------------------------------------------------------
// ConnectorPanelInner — plugin-aware with fallback
// ---------------------------------------------------------------------------

function ConnectorPanelInner({ agent }: { agent: ManagedAgent }) {
  const client = agent.client!;
  const health = agent.connectorHealth;

  // plugin data
  const [plugins, setPlugins] = useState<PluginData[] | null>(null);
  const [pluginsError, setPluginsError] = useState(false);
  const [loading, setLoading] = useState(true);

  // ui state
  const [expanded, setExpanded] = useState<string | null>(null);
  const [toggling, setToggling] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<Record<string, TestResult>>(
    {},
  );

  // fetch plugins
  const fetchPlugins = useCallback(async () => {
    try {
      const all = await client.getPlugins();
      const connectors = all.filter((p) => p.category === "connector");
      setPlugins(connectors);
      setPluginsError(false);
    } catch {
      setPluginsError(true);
      setPlugins(null);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchPlugins();
  }, [fetchPlugins]);

  // toggle enable/disable
  const handleToggle = useCallback(
    async (pluginId: string, enabled: boolean) => {
      setToggling((prev) => new Set(prev).add(pluginId));
      try {
        await client.togglePlugin(pluginId, enabled);
        // update local state optimistically
        setPlugins((prev) =>
          prev
            ? prev.map((p) =>
                p.id === pluginId
                  ? { ...p, enabled, isActive: enabled ? p.isActive : false }
                  : p,
              )
            : prev,
        );
      } catch {
        // revert — refetch
        await fetchPlugins();
      } finally {
        setToggling((prev) => {
          const next = new Set(prev);
          next.delete(pluginId);
          return next;
        });
      }
    },
    [client, fetchPlugins],
  );

  // test connection
  const handleTest = useCallback(
    async (pluginId: string) => {
      setTestResults((prev) => ({
        ...prev,
        [pluginId]: { loading: true },
      }));
      try {
        const res = await client.testPlugin(pluginId);
        setTestResults((prev) => ({
          ...prev,
          [pluginId]: {
            loading: false,
            success: res.success,
            error: res.error,
            message: res.message,
            durationMs: res.durationMs,
          },
        }));
      } catch (err) {
        setTestResults((prev) => ({
          ...prev,
          [pluginId]: {
            loading: false,
            success: false,
            error: err instanceof Error ? err.message : "test failed",
          },
        }));
      }
    },
    [client],
  );

  // count active
  const activeCount = useMemo(
    () => plugins?.filter((p) => p.enabled && (p.isActive || true)).length ?? 0,
    [plugins],
  );

  // if /api/plugins failed, fall back to basic mode
  if (pluginsError) {
    return <FallbackConnectorView agent={agent} />;
  }

  if (loading) {
    return (
      <div className="font-mono text-xs text-text-muted py-4">loading…</div>
    );
  }

  const connectors = plugins ?? [];

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex items-baseline gap-3">
        <h2 className="font-mono text-sm font-medium text-text-light">
          {agent.name}
        </h2>
        <span className="font-mono text-[10px] text-text-subtle tracking-wide">
          connectors
        </span>
        {connectors.length > 0 && (
          <span className="font-mono text-[10px] text-text-muted ml-auto">
            {activeCount} active
          </span>
        )}
      </div>

      {/* empty state */}
      {connectors.length === 0 && (
        <div className="py-6">
          <p className="font-mono text-sm text-text-muted text-center">
            no connector plugins found
          </p>
        </div>
      )}

      {/* connector list */}
      {connectors.length > 0 && (
        <div className="space-y-0">
          {connectors.map((plugin) => {
            const badge = BADGE_COLORS[plugin.id] ?? DEFAULT_BADGE;
            const status = connectorStatus(plugin, health?.[plugin.id]);
            const isExpanded = expanded === plugin.id;
            const isToggling = toggling.has(plugin.id);
            const testState = testResults[plugin.id];
            const params = plugin.parameters ?? [];
            const counts = configuredCount(params);

            return (
              <div
                key={plugin.id}
                className="border-b border-border-subtle last:border-0"
              >
                {/* row */}
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded(isExpanded ? null : plugin.id)
                    }
                    className="flex items-center gap-2.5 text-left group flex-1 min-w-0"
                  >
                    {/* icon badge */}
                    <span
                      className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 font-mono text-xs font-semibold ${badge.bg} ${badge.text}`}
                    >
                      {plugin.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-text-light font-medium">
                          {plugin.name}
                        </span>
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`}
                        />
                        <span
                          className={`font-mono text-[10px] ${status.textColor}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      {plugin.description && (
                        <p className="font-mono text-[10px] text-text-muted truncate mt-0.5">
                          {plugin.description}
                        </p>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* configured count */}
                    {counts.required > 0 && (
                      <span className="font-mono text-[10px] text-text-muted">
                        {counts.set}/{counts.required}
                      </span>
                    )}
                    {/* toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        handleToggle(plugin.id, !plugin.enabled)
                      }
                      disabled={isToggling}
                      className={`w-8 h-4 rounded-full transition-colors relative flex-shrink-0 ${
                        plugin.enabled
                          ? "bg-emerald-500/60"
                          : "bg-neutral-600/40"
                      } ${isToggling ? "opacity-40" : ""}`}
                    >
                      <span
                        className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                          plugin.enabled
                            ? "translate-x-4"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                    {/* chevron */}
                    <span
                      className={`text-text-muted text-xs transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    >
                      ›
                    </span>
                  </div>
                </div>

                {/* test result inline */}
                {testState && !testState.loading && !isExpanded && (
                  <div className="pl-[34px] pb-2">
                    {testState.success ? (
                      <span className="font-mono text-[11px] text-emerald-400">
                        ✓ ok
                        {testState.durationMs != null &&
                          ` · ${testState.durationMs}ms`}
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] text-red-400">
                        ✗ {testState.error || "failed"}
                        {testState.durationMs != null &&
                          ` · ${testState.durationMs}ms`}
                      </span>
                    )}
                  </div>
                )}

                {/* expanded config */}
                {isExpanded && (
                  <div className="pb-4 pl-[34px] pr-2">
                    <PluginConfigForm
                      plugin={plugin}
                      client={client}
                      onSaved={fetchPlugins}
                    />
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        type="button"
                        onClick={() => handleTest(plugin.id)}
                        disabled={testState?.loading}
                        className="font-mono text-[11px] text-text-subtle hover:text-brand transition-colors disabled:opacity-40"
                      >
                        {testState?.loading ? "testing…" : "test connection"}
                      </button>
                      {plugin.setupGuideUrl && (
                        <a
                          href={plugin.setupGuideUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11px] text-text-subtle hover:text-brand transition-colors"
                        >
                          setup guide ↗
                        </a>
                      )}
                      {plugin.homepage && !plugin.setupGuideUrl && (
                        <a
                          href={plugin.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11px] text-text-subtle hover:text-brand transition-colors"
                        >
                          docs ↗
                        </a>
                      )}
                    </div>
                    {/* test result in expanded view */}
                    {testState && !testState.loading && (
                      <div className="mt-2">
                        {testState.success ? (
                          <span className="font-mono text-[11px] text-emerald-400">
                            ✓ connection ok
                            {testState.durationMs != null &&
                              ` · ${testState.durationMs}ms`}
                          </span>
                        ) : (
                          <span className="font-mono text-[11px] text-red-400">
                            ✗ {testState.error || "test failed"}
                            {testState.durationMs != null &&
                              ` · ${testState.durationMs}ms`}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PluginConfigForm — auto-generated from parameter definitions
// ---------------------------------------------------------------------------

function PluginConfigForm({
  plugin,
  client,
  onSaved,
}: {
  plugin: PluginData;
  client: CloudApiClient;
  onSaved: () => void;
}) {
  const params = plugin.parameters ?? [];
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);
  const saveOkTimer = useRef<ReturnType<typeof setTimeout>>();

  const dirty = Object.keys(edits).length > 0;

  const handleChange = useCallback((key: string, value: string) => {
    setEdits((prev) => {
      const next = { ...prev };
      // track the edit
      next[key] = value;
      return next;
    });
    setSaveOk(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!dirty) return;
    setSaving(true);
    setSaveError(null);
    setSaveOk(false);
    try {
      await client.savePluginConfig(plugin.id, edits);
      setEdits({});
      setSaveOk(true);
      clearTimeout(saveOkTimer.current);
      saveOkTimer.current = setTimeout(() => setSaveOk(false), 3000);
      onSaved();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "failed to save",
      );
    } finally {
      setSaving(false);
    }
  }, [client, plugin.id, edits, dirty, onSaved]);

  useEffect(
    () => () => clearTimeout(saveOkTimer.current),
    [],
  );

  if (params.length === 0) {
    return (
      <p className="font-mono text-[11px] text-text-muted">
        no configurable parameters
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {params.map((param) => (
        <ParamField
          key={param.key}
          param={param}
          value={edits[param.key]}
          onChange={(v) => handleChange(param.key, v)}
        />
      ))}
      <div className="flex items-center gap-3 mt-2">
        {dirty && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="font-mono text-[11px] text-text-subtle hover:text-text-light transition-colors disabled:opacity-40"
          >
            {saving ? "saving…" : "save"}
          </button>
        )}
        {saveOk && (
          <span className="font-mono text-[11px] text-emerald-400">
            ✓ saved
          </span>
        )}
        {saveError && (
          <span className="font-mono text-[11px] text-red-400">
            {saveError}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ParamField — type-aware input
// ---------------------------------------------------------------------------

function ParamField({
  param,
  value,
  onChange,
}: {
  param: PluginParam;
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  const isEdited = value !== undefined;
  const isBool = param.type === "boolean";
  const hasOptions =
    param.options && param.options.length > 0;

  // boolean toggle
  if (isBool) {
    const current = isEdited
      ? value === "true"
      : param.currentValue === true ||
        param.currentValue === "true";
    return (
      <div className="flex items-center gap-3 py-0.5">
        <label className="font-mono text-[10px] text-text-subtle w-40 flex-shrink-0 text-left truncate">
          {param.key}
          {param.required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <button
          type="button"
          onClick={() => onChange(current ? "false" : "true")}
          className={`w-7 h-3.5 rounded-full transition-colors relative flex-shrink-0 ${
            current ? "bg-emerald-500/60" : "bg-neutral-600/40"
          }`}
        >
          <span
            className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-transform ${
              current ? "translate-x-3.5" : "translate-x-0.5"
            }`}
          />
        </button>
        {param.description && (
          <span className="font-mono text-[10px] text-text-muted truncate">
            {param.description}
          </span>
        )}
      </div>
    );
  }

  // select dropdown
  if (hasOptions) {
    const currentVal = isEdited
      ? value
      : param.currentValue != null
        ? String(param.currentValue)
        : "";
    return (
      <div className="flex items-center gap-3 py-0.5">
        <label className="font-mono text-[10px] text-text-subtle w-40 flex-shrink-0 text-left truncate">
          {param.key}
          {param.required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <select
          value={currentVal}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-dark border border-border-subtle px-2 py-1 font-mono text-[11px] text-text-light focus:outline-none focus:border-brand"
        >
          <option value="">—</option>
          {param.options!.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // text / password input
  const isSensitive = param.sensitive;
  const placeholder = isSensitive && param.isSet ? "••••••••" : param.description || param.key;

  return (
    <div className="flex items-baseline gap-3 py-0.5">
      <label className="font-mono text-[10px] text-text-subtle w-40 flex-shrink-0 text-left truncate">
        {param.key}
        {param.required && <span className="text-red-400 ml-0.5">*</span>}
        {isSensitive && (
          <span className="text-text-muted ml-1" title="sensitive">
            🔒
          </span>
        )}
      </label>
      <input
        type={isSensitive ? "password" : "text"}
        value={isEdited ? value : ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-dark border border-border-subtle px-2 py-1 font-mono text-[11px] text-text-light placeholder:text-text-muted focus:outline-none focus:border-brand"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// FallbackConnectorView — basic mode when /api/plugins is unavailable
// ---------------------------------------------------------------------------

function FallbackConnectorView({ agent }: { agent: ManagedAgent }) {
  const health = agent.connectorHealth;
  const [connectorConfig, setConnectorConfig] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    if (!agent.client) return;
    setConfigLoading(true);
    try {
      const res = await agent.client.getConnectors();
      setConnectorConfig(res.connectors);
    } catch {
      // ignore
    } finally {
      setConfigLoading(false);
    }
  }, [agent.client]);

  useEffect(() => {
    if (expanded && !connectorConfig && !configLoading) {
      fetchConfig();
    }
  }, [expanded, connectorConfig, configLoading, fetchConfig]);

  const connectorNames = health ? Object.keys(health) : [];
  const configNames = connectorConfig ? Object.keys(connectorConfig) : [];
  const allNames = Array.from(new Set([...connectorNames, ...configNames]));

  const STATUS_DOT: Record<string, string> = {
    ok: "bg-emerald-500",
    configured: "bg-amber-500",
    missing: "bg-neutral-500/40",
    unknown: "bg-neutral-500/40",
  };

  function statusLabel(raw: string): string {
    switch (raw) {
      case "ok":
        return "connected";
      case "configured":
        return "configured";
      case "missing":
        return "not configured";
      default:
        return raw;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-3">
        <h2 className="font-mono text-sm font-medium text-text-light">
          {agent.name}
        </h2>
        <span className="font-mono text-[10px] text-text-subtle tracking-wide">
          connectors
        </span>
        <span className="font-mono text-[10px] text-text-muted ml-auto">
          basic mode
        </span>
      </div>

      {allNames.length === 0 && (
        <p className="font-mono text-sm text-text-muted text-center py-6">
          no connectors detected
        </p>
      )}

      {allNames.length > 0 && (
        <div className="space-y-0">
          {allNames.map((name) => {
            const status = (health?.[name] as string) ?? "unknown";
            const dotColor = STATUS_DOT[status] ?? STATUS_DOT.unknown;
            const badge = BADGE_COLORS[name] ?? DEFAULT_BADGE;
            const isExpanded = expanded === name;

            return (
              <div
                key={name}
                className="border-b border-border-subtle last:border-0"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : name)}
                  className="flex items-center gap-2.5 py-2.5 w-full text-left"
                >
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 font-mono text-xs font-semibold ${badge.bg} ${badge.text}`}
                  >
                    {name.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-mono text-xs text-text-light font-medium">
                    {name}
                  </span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`}
                  />
                  <span className="font-mono text-[11px] text-text-muted ml-auto">
                    {statusLabel(status)}
                  </span>
                </button>

                {isExpanded && (
                  <div className="pb-3 pl-[34px]">
                    {configLoading && (
                      <p className="font-mono text-[11px] text-text-muted">
                        loading…
                      </p>
                    )}
                    {!configLoading && connectorConfig?.[name] && (
                      <FallbackConfigView
                        data={connectorConfig[name]}
                      />
                    )}
                    {!configLoading && !connectorConfig?.[name] && (
                      <p className="font-mono text-[11px] text-text-muted">
                        no config data
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FallbackConfigView — read-only display of connector config
// ---------------------------------------------------------------------------

function FallbackConfigView({ data }: { data: unknown }) {
  if (typeof data !== "object" || data === null) {
    return (
      <span className="font-mono text-[11px] text-text-muted">—</span>
    );
  }
  const entries = Object.entries(data as Record<string, unknown>);
  if (entries.length === 0) {
    return (
      <span className="font-mono text-[11px] text-text-muted">
        empty config
      </span>
    );
  }
  return (
    <div className="space-y-1">
      {entries.map(([key, val]) => (
        <div key={key} className="flex items-baseline gap-3">
          <span className="font-mono text-[10px] text-text-subtle w-28 flex-shrink-0">
            {key}
          </span>
          <span className="font-mono text-[11px] text-text-muted">
            {redactValue(val)}
          </span>
        </div>
      ))}
    </div>
  );
}

function redactValue(value: unknown): string {
  if (typeof value === "string") {
    if (value.length > 8) return `${value.slice(0, 4)}…${value.slice(-2)}`;
    if (value.length > 0) return "••••";
    return "(empty)";
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (value === null || value === undefined) return "—";
  return "…";
}
