import { useEffect, useState } from "react";
import { useAgents } from "../../lib/AgentProvider";
import { CloudClient, type CreditBalance } from "../../lib/cloud-api";
import { useAuth } from "../../lib/useAuth";

const SECTIONS = [
  { id: "agents", label: "Agents", shortcut: "1" },
  { id: "metrics", label: "Metrics", shortcut: "2", requiresAgents: true },
  { id: "logs", label: "Logs", shortcut: "3", requiresAgents: true },
  { id: "credits", label: "Credits", shortcut: "4", requiresAuth: true },
  { id: "wallet", label: "Wallet", shortcut: "5", requiresAgents: true },
  { id: "connectors", label: "Connectors", shortcut: "6", requiresAgents: true },
] as const;

export type DashboardSection = (typeof SECTIONS)[number]["id"] | "billing";

interface SidebarProps {
  active: DashboardSection;
  onChange: (section: DashboardSection) => void;
}

export function Sidebar({ active, onChange }: SidebarProps) {
  const { isAuthenticated: authed, token, signOut } = useAuth();
  const { agents } = useAgents();
  const hasAgents = agents.length > 0;
  const visibleSections = SECTIONS.filter((section) => {
    const requiresAuth =
      "requiresAuth" in section ? section.requiresAuth : false;
    const requiresAgents =
      "requiresAgents" in section ? section.requiresAgents : false;
    return (!requiresAuth || authed) && (!requiresAgents || hasAgents);
  });
  const [credits, setCredits] = useState<CreditBalance | null>(null);

  useEffect(() => {
    if (!authed || !token) {
      setCredits(null);
      return;
    }
    const cc = new CloudClient(token);
    cc.getCreditsBalance()
      .then(setCredits)
      .catch(() => setCredits(null));
  }, [authed, token]);

  const fleetLabel =
    agents.length === 0
      ? "no agents"
      : `${agents.length} agent${agents.length !== 1 ? "s" : ""}`;

  const connectionLabel = authed ? "cloud connected" : "local only";

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-52 border-r border-border flex-shrink-0 bg-dark-secondary">
        {/* Identity block */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-sm font-medium text-text-light">
                milady
              </span>
              <span className="font-mono text-[11px] text-text-subtle tabular-nums">
                {fleetLabel}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  authed
                    ? "bg-emerald-400"
                    : "bg-text-muted/40"
                }`}
              />
              <span className="font-mono text-[10px] text-text-subtle">
                {connectionLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2">
          <div className="space-y-0.5">
            {visibleSections.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => onChange(s.id)}
                className={`group w-full flex items-center justify-between gap-2 text-left px-3 py-2.5 
                  font-mono text-xs tracking-wide transition-all duration-150 relative
                  ${
                    active === s.id
                      ? "text-text-light bg-surface"
                      : "text-text-muted hover:text-text-light hover:bg-surface/50"
                  }`}
              >
                {/* Active indicator */}
                {active === s.id && (
                  <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand" />
                )}
                <span>{s.label.toUpperCase()}</span>
                <span
                  className={`text-[10px] ${active === s.id ? "text-brand" : "text-text-subtle"}`}
                >
                  {s.shortcut}
                </span>
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-border">
          {/* Credit balance — compact, glanceable */}
          {authed && (
            <button
              type="button"
              onClick={() => onChange("credits")}
              className="w-full flex items-center gap-2 px-4 py-2.5 
                hover:bg-surface/50 transition-all duration-150"
            >
              <span className="font-mono text-[10px] text-text-subtle">bal</span>
              <span className="font-mono text-sm text-text-light tabular-nums">
                {credits?.balance?.toLocaleString() ?? "—"}
              </span>
            </button>
          )}

          {/* Sign out */}
          {authed && (
            <button
              type="button"
              onClick={() => signOut()}
              className="w-full flex items-center gap-2 px-4 py-2.5 
                font-mono text-[10px] text-text-subtle hover:text-red-400 
                border-t border-border-subtle transition-colors"
            >
              sign out
            </button>
          )}
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden sticky top-[56px] z-30 border-b border-border bg-dark/95 backdrop-blur">
        <div className="flex items-center overflow-x-auto px-2 py-1.5">
          {visibleSections.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => onChange(s.id)}
              className={`flex-shrink-0 px-3 py-2 font-mono text-[11px] tracking-wide transition-all duration-150
                ${
                  active === s.id
                    ? "text-brand"
                    : "text-text-muted hover:text-text-light"
                }`}
            >
              {s.label.toUpperCase()}
            </button>
          ))}
          {authed && credits && (
            <span className="flex-shrink-0 ml-auto px-2.5 py-1.5 font-mono text-xs text-text-subtle tabular-nums">
              {credits.balance?.toLocaleString()}
            </span>
          )}
          {authed && (
            <button
              type="button"
              onClick={() => signOut()}
              className="flex-shrink-0 px-3 py-2 font-mono text-[10px] text-text-subtle hover:text-red-400 transition-colors"
            >
              exit
            </button>
          )}
        </div>
      </div>
    </>
  );
}
