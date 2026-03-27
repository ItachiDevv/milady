import { useEffect, useState } from "react";
import { AgentProvider, useAgents } from "../../lib/AgentProvider";
import { useAuth } from "../../lib/useAuth";
import { AgentGrid } from "./AgentGrid";
import { CloudLoginBanner } from "./AuthGate";
import { ConnectorPanel } from "./ConnectorPanel";
import { CreditsPanel } from "./CreditsPanel";
import { LogsPanel } from "./LogsPanel";
import { MetricsPanel } from "./MetricsPanel";
import { type DashboardSection, Sidebar } from "./Sidebar";
import { SourceBar } from "./SourceBar";
import { WalletPanel } from "./WalletPanel";

interface DashboardNav {
  section: DashboardSection;
  agentId?: string;
}

export function Dashboard() {
  const [nav, setNav] = useState<DashboardNav>({ section: "agents" });
  const { isAuthenticated: authed } = useAuth();

  const navigate = (section: DashboardSection, agentId?: string) => {
    setNav((prev) => ({ section, agentId: agentId ?? prev.agentId }));
  };

  // Snap back to agents section if user signs out while on credits
  useEffect(() => {
    if (!authed && nav.section === "credits") {
      setNav((prev) => ({ ...prev, section: "agents" }));
    }
  }, [authed, nav.section]);

  return (
    <AgentProvider>
      <div
        data-testid="dashboard"
        className="min-h-screen bg-dark text-text-light"
      >
        <div className="pt-[56px] flex min-h-screen flex-col md:flex-row">
          <Sidebar active={nav.section} onChange={(s) => navigate(s)} />
          <div className="flex-1 flex flex-col min-w-0">
            <SourceBar />
            <CloudLoginPrompt />
            <main className="flex-1 px-4 sm:px-5 md:px-8 py-4 sm:py-6">
              <DashboardContent
                section={nav.section}
                agentId={nav.agentId}
                onNavigate={navigate}
              />
            </main>
          </div>
        </div>
      </div>
    </AgentProvider>
  );
}

/** Show cloud login banner only when user isn't authenticated */
function CloudLoginPrompt() {
  const { refresh } = useAgents();
  const { isAuthenticated: authed } = useAuth();
  if (authed) return null;
  return <CloudLoginBanner onAuthenticated={() => refresh()} />;
}

function DashboardContent({
  section,
  agentId,
  onNavigate,
}: {
  section: DashboardSection;
  agentId?: string;
  onNavigate: (section: DashboardSection, agentId?: string) => void;
}) {
  switch (section) {
    case "agents":
      return <AgentGrid />;
    case "metrics":
      return <MetricsPanel />;
    case "logs":
      return <LogsPanel />;
    case "credits":
      return <CreditsPanel />;
    case "wallet":
      return <WalletPanel />;
    case "connectors":
      return <ConnectorPanel agentId={agentId} onNavigate={onNavigate} />;
  }
}
