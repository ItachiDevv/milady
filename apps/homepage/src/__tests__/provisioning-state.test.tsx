/**
 * Regression tests for provisioning-state UI guards:
 * - AgentCard: Open UI button is gated on agent.state === "running"
 * - AgentDetail: OPEN UI header button is gated on agent.state === "running"
 *
 * Covers the fix in:
 *   apps/homepage/src/components/dashboard/AgentCard.tsx
 *   apps/homepage/src/components/dashboard/AgentDetail.tsx
 */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AgentCard } from "../components/dashboard/AgentCard";
import { AgentDetail } from "../components/dashboard/AgentDetail";
import type { AgentStatus } from "../lib/cloud-api";

vi.mock("../lib/open-web-ui", () => ({ openWebUI: vi.fn() }));
vi.mock("../lib/AgentProvider", () => ({
  useAgents: vi.fn(() => ({ agents: [], loading: false })),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function makeAgentStatus(overrides: Partial<AgentStatus> = {}): AgentStatus {
  return {
    agentName: "TestAgent",
    model: "gpt-4",
    state: "running",
    uptime: 0,
    ...overrides,
  };
}

const cardBaseProps = {
  source: "local" as const,
  onPlay: vi.fn(),
  onResume: vi.fn(),
  onPause: vi.fn(),
  onStop: vi.fn(),
  onSelect: vi.fn(),
  selected: false,
};

const managedAgent = {
  id: "local-default",
  name: "TestAgent",
  source: "local" as const,
  status: "running" as const,
  model: "gpt-4",
};

/* ------------------------------------------------------------------ */
/*  AgentCard — Open UI button gating                                   */
/* ------------------------------------------------------------------ */

describe("AgentCard — Open UI button gating on agent.state", () => {
  it("shows Open UI button when running and webUiUrl is provided", () => {
    render(
      <AgentCard
        {...cardBaseProps}
        agent={makeAgentStatus({ state: "running" })}
        webUiUrl="http://localhost:2138"
      />,
    );
    expect(screen.getByLabelText(/open testagent ui/i)).toBeTruthy();
  });

  it("hides Open UI button when provisioning even if webUiUrl is set", () => {
    render(
      <AgentCard
        {...cardBaseProps}
        agent={makeAgentStatus({ state: "provisioning" })}
        webUiUrl="http://localhost:2138"
      />,
    );
    expect(screen.queryByLabelText(/open testagent ui/i)).toBeNull();
  });

  it("hides Open UI button when stopped even for cloud source", () => {
    render(
      <AgentCard
        {...cardBaseProps}
        source="cloud"
        agent={makeAgentStatus({ state: "stopped" })}
        webUiUrl="https://agent.milady.ai"
      />,
    );
    expect(screen.queryByLabelText(/open testagent ui/i)).toBeNull();
  });

  it("hides Open UI button when paused", () => {
    render(
      <AgentCard
        {...cardBaseProps}
        agent={makeAgentStatus({ state: "paused" })}
        webUiUrl="http://localhost:2138"
      />,
    );
    expect(screen.queryByLabelText(/open testagent ui/i)).toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/*  AgentDetail — OPEN UI header button gating                          */
/* ------------------------------------------------------------------ */

describe("AgentDetail — OPEN UI header button gating on agent.state", () => {
  it("shows OPEN UI button when running and webUIUrl is set", () => {
    render(
      <AgentDetail
        agent={makeAgentStatus({ state: "running" })}
        managedAgent={managedAgent}
        connectionId="local-default"
        webUIUrl="http://localhost:2138"
      />,
    );
    expect(screen.getByText("OPEN UI")).toBeTruthy();
  });

  it("hides OPEN UI button when provisioning even if webUIUrl is set", () => {
    render(
      <AgentDetail
        agent={makeAgentStatus({ state: "provisioning" })}
        managedAgent={{ ...managedAgent, status: "provisioning" as const }}
        connectionId="local-default"
        webUIUrl="http://localhost:2138"
      />,
    );
    expect(screen.queryByText("OPEN UI")).toBeNull();
  });

  it("hides OPEN UI button when running but no webUIUrl", () => {
    render(
      <AgentDetail
        agent={makeAgentStatus({ state: "running" })}
        managedAgent={managedAgent}
        connectionId="local-default"
      />,
    );
    expect(screen.queryByText("OPEN UI")).toBeNull();
  });
});
