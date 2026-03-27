import { Button } from "@miladyai/ui";
import { useCallback, useEffect, useState } from "react";
import { useAgents } from "../../lib/AgentProvider";
import { openWebUI } from "../../lib/open-web-ui";
import {
  MIN_DEPOSIT_DISPLAY,
  PRICE_IDLE_PER_HR,
  PRICE_RUNNING_PER_HR,
} from "../../lib/pricing-constants";
import { useAuth } from "../../lib/useAuth";
import { AgentCard } from "./AgentCard";
import { AgentDetail } from "./AgentDetail";
import { CreateAgentForm } from "./CreateAgentForm";

export function AgentGrid() {
  const {
    filteredAgents: agents,
    loading,
    isRefreshing,
    error,
    clearError,
    refresh,
  } = useAgents();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{
    tone: "info" | "success" | "error";
    text: string;
    busy?: boolean;
  } | null>(null);

  const handleAction = useCallback(
    async (agentId: string, action: "play" | "resume" | "pause" | "stop") => {
      const agent = agents.find((a) => a.id === agentId);
      if (!agent) return;
      const verb =
        action === "play"
          ? "starting"
          : action === "resume"
            ? "resuming"
            : action === "pause"
              ? "pausing"
              : "stopping";
      setActionBusyId(agentId);
      setActionNotice({
        tone: "info",
        text: `${verb} ${agent.name}\u2026`,
        busy: true,
      });
      try {
        if (
          agent.source === "cloud" &&
          agent.cloudClient &&
          agent.cloudAgentId
        ) {
          if (action === "play" || action === "resume") {
            await agent.cloudClient.resumeAgent(agent.cloudAgentId);
          } else if (action === "pause" || action === "stop") {
            await agent.cloudClient.suspendAgent(agent.cloudAgentId);
          }
        } else if (agent.client) {
          if (action === "play") await agent.client.playAgent();
          else if (action === "resume") await agent.client.resumeAgent();
          else if (action === "pause") await agent.client.pauseAgent();
          else if (action === "stop") await agent.client.stopAgent();
        }
        await refresh();
        setActionNotice({
          tone: "success",
          text: `${agent.name} ${action === "pause" ? "paused" : action === "stop" ? "stopped" : "started"}`,
        });
      } catch (err) {
        console.error(`Failed to ${action} agent:`, err);
        setActionNotice({
          tone: "error",
          text: `${agent.name}: ${err instanceof Error ? err.message : `failed to ${action}`}`,
        });
      } finally {
        setActionBusyId((current) => (current === agentId ? null : current));
      }
    },
    [agents, refresh],
  );

  useEffect(() => {
    if (!actionNotice || actionNotice.busy) return;
    const timer = window.setTimeout(() => setActionNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [actionNotice]);

  const getWebUIUrl = useCallback((agent: (typeof agents)[0]) => {
    if (agent.webUiUrl) return agent.webUiUrl;
    return agent.sourceUrl;
  }, []);

  // Loading skeleton — minimal shimmer blocks
  if (loading) {
    return (
      <div className="space-y-6 animate-[fade-up_0.4s_ease-out_both]">
        <div className="h-5 w-32 bg-surface animate-[shimmer_1.8s_ease-in-out_infinite] bg-[linear-gradient(90deg,var(--color-surface)_0%,var(--color-surface-elevated)_40%,var(--color-surface)_80%)] bg-[length:200%_100%]" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 border-l-2 border-l-text-muted/20 border border-border border-l-0 bg-surface animate-[shimmer_1.8s_ease-in-out_infinite] bg-[linear-gradient(90deg,var(--color-surface)_0%,var(--color-surface-elevated)_40%,var(--color-surface)_80%)] bg-[length:200%_100%] animate-[fade-up_0.4s_ease-out_both]"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  const selected = selectedId ? agents.find((a) => a.id === selectedId) : null;
  const liveCount = agents.filter(
    (a) => a.status === "running" || a.status === "provisioning",
  ).length;

  return (
    <div className="space-y-5">
      {/* Header — operational, inline counts */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          {agents.length > 0 ? (
            <h2 className="text-sm text-text-light">
              <span className="font-mono tabular-nums">{agents.length}</span>
              {" agent"}
              {agents.length !== 1 ? "s" : ""}
              {liveCount > 0 && (
                <span className="text-text-muted">
                  {" \u00B7 "}
                  <span className="font-mono tabular-nums text-emerald-400">
                    {liveCount}
                  </span>
                  {" live"}
                </span>
              )}
            </h2>
          ) : (
            <h2 className="text-sm text-text-muted">agents</h2>
          )}
          {(isRefreshing || isCreating) && agents.length > 0 && (
            <span className="text-[10px] font-mono text-text-subtle animate-pulse">
              {isCreating ? "creating\u2026" : "syncing\u2026"}
            </span>
          )}
        </div>
        {!showCreate && (
          <Button
            type="button"
            onClick={() => setShowCreate(true)}
            className="h-9 px-4 bg-brand text-dark font-mono text-[11px] font-semibold tracking-wide
              hover:bg-brand-hover transition-colors sm:w-auto"
          >
            + new agent
          </Button>
        )}
      </div>

      {/* Inline status notices */}
      {error && (
        <div
          className="flex items-center gap-3 text-xs font-mono"
          role="alert"
          aria-live="assertive"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
          <span className="text-red-400 truncate">{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="text-red-400/50 hover:text-red-400 transition-colors ml-auto flex-shrink-0"
            aria-label="Dismiss error"
          >
            \u00D7
          </button>
        </div>
      )}

      {actionNotice && (
        <div
          className="flex items-center gap-3 text-xs font-mono"
          role={actionNotice.tone === "error" ? "alert" : "status"}
          aria-live={actionNotice.tone === "error" ? "assertive" : "polite"}
          aria-busy={actionNotice.busy ? true : undefined}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              actionNotice.tone === "error"
                ? "bg-red-400"
                : actionNotice.tone === "success"
                  ? "bg-emerald-400"
                  : "bg-brand animate-pulse"
            }`}
          />
          <span
            className={
              actionNotice.tone === "error"
                ? "text-red-400"
                : actionNotice.tone === "success"
                  ? "text-emerald-400"
                  : "text-text-light"
            }
          >
            {actionNotice.text}
          </span>
          {!actionNotice.busy && (
            <button
              type="button"
              onClick={() => setActionNotice(null)}
              className="text-text-subtle hover:text-text-light transition-colors ml-auto"
              aria-label="Dismiss action notice"
            >
              \u00D7
            </button>
          )}
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <CreateAgentForm
          onAuthenticated={() => refresh()}
          onCreated={async () => {
            setShowCreate(false);
            setIsCreating(true);
            await refresh();
            setIsCreating(false);
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* Agent list or empty state */}
      {agents.length === 0 && !showCreate ? (
        <EmptyState onCreateClick={() => setShowCreate(true)} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {agents.map((agent, i) => (
            <div
              key={agent.id}
              className="animate-[fade-up_0.4s_ease-out_both]"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <AgentCard
                agent={{
                  agentName: agent.name,
                  state: agent.status,
                  model: agent.model ?? "\u2014",
                  uptime: agent.uptime,
                  memories: agent.memories,
                }}
                source={agent.source}
                connectorHealth={agent.connectorHealth}
                sourceUrl={agent.sourceUrl}
                webUiUrl={getWebUIUrl(agent)}
                nodeId={agent.nodeId}
                lastHeartbeat={agent.lastHeartbeat}
                billing={agent.billing}
                createdAt={agent.createdAt}
                updatedAt={agent.updatedAt}
                region={agent.region}
                tokens={agent.tokens}
                onPlay={() => handleAction(agent.id, "play")}
                onResume={() => handleAction(agent.id, "resume")}
                onPause={() => handleAction(agent.id, "pause")}
                onStop={() => handleAction(agent.id, "stop")}
                onSelect={() =>
                  setSelectedId(selectedId === agent.id ? null : agent.id)
                }
                onOpenUI={() => {
                  const url = getWebUIUrl(agent);
                  if (!url) return;
                  openWebUI(url, agent.source, agent.cloudAgentId);
                }}
                detailsId={`homepage-agent-detail-${agent.id}`}
                selected={selectedId === agent.id}
                busy={actionBusyId === agent.id}
              />
            </div>
          ))}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <section
          id={`homepage-agent-detail-${selected.id}`}
          className="animate-[fade-up_0.4s_ease-out_both]"
          aria-label={`${selected.name} details`}
        >
          <AgentDetail
            agent={{
              agentName: selected.name,
              state: selected.status,
              model: selected.model ?? "\u2014",
              uptime: selected.uptime,
              memories: selected.memories,
            }}
            managedAgent={selected}
            connectionId={selected.id}
            webUIUrl={getWebUIUrl(selected)}
          />
        </section>
      )}
    </div>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  const { isAuthenticated: authed } = useAuth();

  return (
    <div className="py-12 animate-[fade-up_0.4s_ease-out_both]">
      <h3 className="font-mono text-sm text-text-light mb-2">
        NO AGENTS FOUND
      </h3>
      <p className="text-xs text-text-muted max-w-md leading-relaxed mb-6">
        {authed
          ? "start milady locally or deploy a cloud agent."
          : "start milady locally to see agents here, or sign in for cloud hosting."}
      </p>

      {/* Pricing — single inline row, not a grid */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-8 text-xs font-mono">
        <span>
          <span className="text-text-subtle">RUNNING</span>{" "}
          <span className="text-brand tabular-nums">
            {PRICE_RUNNING_PER_HR}/hr
          </span>
        </span>
        <span>
          <span className="text-text-subtle">IDLE</span>{" "}
          <span className="text-text-light tabular-nums">
            {PRICE_IDLE_PER_HR}/hr
          </span>
        </span>
        <span>
          <span className="text-text-subtle">MIN. DEPOSIT</span>{" "}
          <span className="text-text-light tabular-nums">
            {MIN_DEPOSIT_DISPLAY}
          </span>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <a
          href="/#install"
          className="inline-flex items-center px-4 py-2
            bg-brand text-dark font-mono text-[11px] font-semibold tracking-wide
            hover:bg-brand-hover transition-colors"
        >
          DOWNLOAD APP
        </a>
        <button
          type="button"
          onClick={onCreateClick}
          className="inline-flex items-center px-4 py-2
            text-text-muted font-mono text-[11px] tracking-wide
            border border-border hover:text-text-light hover:border-text-muted
            transition-colors"
        >
          + CREATE CLOUD AGENT
        </button>
      </div>
    </div>
  );
}
