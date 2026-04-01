// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchMock, mockClient } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  mockClient: {
    setBaseUrl: vi.fn(),
    setToken: vi.fn(),
  },
}));

vi.mock("../api", () => ({
  client: mockClient,
}));

import { applyLaunchConnectionFromUrl } from "./browser-launch";

function setUrl(path: string): void {
  window.history.replaceState({}, "", path);
}

describe("applyLaunchConnectionFromUrl", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    mockClient.setBaseUrl.mockReset();
    mockClient.setToken.mockReset();
    sessionStorage.clear();
    vi.stubGlobal("fetch", fetchMock);
    setUrl("/");
  });

  it("exchanges a managed cloud launch session and strips launch params", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            connection: {
              apiBase: "https://agent-123.containers.elizacloud.ai",
              token: "managed-backend-token",
            },
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    setUrl(
      "/?cloudLaunchSession=session-123&cloudLaunchBase=https%3A%2F%2Felizacloud.ai",
    );

    await expect(applyLaunchConnectionFromUrl()).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://elizacloud.ai/api/v1/milady/launch-sessions/session-123",
      expect.objectContaining({
        method: "GET",
        redirect: "manual",
      }),
    );
    expect(mockClient.setBaseUrl).toHaveBeenCalledWith(
      "https://agent-123.containers.elizacloud.ai",
    );
    expect(mockClient.setToken).toHaveBeenCalledWith("managed-backend-token");
    expect(window.location.search).toBe("");
  });

  it("falls back to the legacy eliza launch-session path when milady path is unavailable", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              connection: {
                apiBase: "https://agent-legacy.containers.elizacloud.ai",
                token: "legacy-token",
              },
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      );

    setUrl(
      "/?cloudLaunchSession=session-legacy&cloudLaunchBase=https%3A%2F%2Felizacloud.ai",
    );

    await expect(applyLaunchConnectionFromUrl()).resolves.toBe(true);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://elizacloud.ai/api/v1/milady/launch-sessions/session-legacy",
      expect.objectContaining({ method: "GET", redirect: "manual" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://elizacloud.ai/api/v1/eliza/launch-sessions/session-legacy",
      expect.objectContaining({ method: "GET", redirect: "manual" }),
    );
    expect(mockClient.setBaseUrl).toHaveBeenCalledWith(
      "https://agent-legacy.containers.elizacloud.ai",
    );
    expect(mockClient.setToken).toHaveBeenCalledWith("legacy-token");
  });

  it("falls back to direct launch params and strips them after applying", async () => {
    setUrl(
      "/?apiBase=https%3A%2F%2Fagent-456.containers.elizacloud.ai&token=backend-token",
    );

    await expect(applyLaunchConnectionFromUrl()).resolves.toBe(true);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockClient.setBaseUrl).toHaveBeenCalledWith(
      "https://agent-456.containers.elizacloud.ai",
    );
    expect(mockClient.setToken).toHaveBeenCalledWith("backend-token");
    expect(window.location.search).toBe("");
  });

  it("returns false when no launch params are present", async () => {
    await expect(applyLaunchConnectionFromUrl()).resolves.toBe(false);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockClient.setBaseUrl).not.toHaveBeenCalled();
    expect(mockClient.setToken).not.toHaveBeenCalled();
  });

  describe("cloud pairing token exchange (/pair?token flow)", () => {
    it("exchanges a cloud pairing token for the agent API key and strips the token param", async () => {
      fetchMock.mockResolvedValue(
        new Response(
          JSON.stringify({
            message: "Paired successfully",
            apiKey: "milady_abc123",
            agentName: "MyAgent",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      );

      setUrl("/?token=cloud-one-time-token-xyz");

      await expect(applyLaunchConnectionFromUrl()).resolves.toBe(true);

      expect(fetchMock).toHaveBeenCalledWith(
        "https://www.elizacloud.ai/api/auth/pair",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ token: "cloud-one-time-token-xyz" }),
        }),
      );
      expect(mockClient.setBaseUrl).not.toHaveBeenCalled();
      expect(mockClient.setToken).toHaveBeenCalledWith("milady_abc123");
      // Token param must be stripped from URL
      expect(window.location.search).toBe("");
    });

    it("returns false when the pairing token exchange fails (non-200 response)", async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ error: "Invalid or expired pairing code" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      );

      setUrl("/?token=expired-token");

      await expect(applyLaunchConnectionFromUrl()).resolves.toBe(false);

      expect(mockClient.setToken).not.toHaveBeenCalled();
    });

    it("returns false when the pairing exchange returns an empty apiKey", async () => {
      fetchMock.mockResolvedValue(
        new Response(
          JSON.stringify({ message: "Paired successfully", apiKey: null }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

      setUrl("/?token=some-token");

      await expect(applyLaunchConnectionFromUrl()).resolves.toBe(false);

      expect(mockClient.setToken).not.toHaveBeenCalled();
    });

    it("returns false and does not throw when the fetch rejects (network error)", async () => {
      fetchMock.mockRejectedValue(new Error("Network error"));

      setUrl("/?token=some-token");

      await expect(applyLaunchConnectionFromUrl()).resolves.toBe(false);

      expect(mockClient.setToken).not.toHaveBeenCalled();
    });

    it("uses a custom cloudApiBase from window.__ELIZA_CLOUD_API_BASE__", async () => {
      // Inject a custom cloud base URL via the window global.
      vi.stubGlobal(
        "__ELIZA_CLOUD_API_BASE__",
        "https://custom.elizacloud.example.com",
      );

      fetchMock.mockResolvedValue(
        new Response(
          JSON.stringify({ apiKey: "milady_custom123" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

      setUrl("/?token=cloud-token-custom");

      await expect(applyLaunchConnectionFromUrl()).resolves.toBe(true);

      expect(fetchMock).toHaveBeenCalledWith(
        "https://custom.elizacloud.example.com/api/auth/pair",
        expect.anything(),
      );
      expect(mockClient.setToken).toHaveBeenCalledWith("milady_custom123");

      // Restore default
      vi.unstubAllGlobals();
    });

    it("does not attempt pair exchange when apiBase param is present alongside token", async () => {
      setUrl(
        "/?apiBase=https%3A%2F%2Fagent.example.com&token=my-token",
      );

      await expect(applyLaunchConnectionFromUrl()).resolves.toBe(true);

      // Should use the direct launch params path, NOT call /api/auth/pair
      expect(mockClient.setBaseUrl).toHaveBeenCalledWith(
        "https://agent.example.com",
      );
      expect(mockClient.setToken).toHaveBeenCalledWith("my-token");
      // fetch should not have been called for /api/auth/pair
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
