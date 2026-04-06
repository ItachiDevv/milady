// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchWithTimeoutMock, prefetchVrmToCacheMock } = vi.hoisted(() => ({
  fetchWithTimeoutMock: vi.fn(),
  prefetchVrmToCacheMock: vi.fn(),
}));

vi.mock("../../config/boot-config", () => ({
  getBootConfig: () => ({
    apiBase: "http://localhost:3000",
    assetBaseUrl: "http://localhost:3000/assets",
    vrmAssets: [],
    onboardingStyles: [],
  }),
}));

vi.mock("../../state/vrm", () => ({
  getVrmPreviewUrl: (index: number) =>
    `https://cdn.example/preview-${index}.png`,
  getVrmUrl: (index: number) => `https://cdn.example/avatar-${index}.vrm`,
}));

vi.mock("../../utils/api-request", () => ({
  fetchWithTimeout: (...args: unknown[]) => fetchWithTimeoutMock(...args),
  resolveCompatApiToken: () => null,
}));

vi.mock("../../utils/asset-url", () => ({
  resolveApiUrl: (path: string) => `http://localhost:3000${path}`,
}));

vi.mock("../../voice/types", () => ({
  PREMADE_VOICES: [
    { id: "alice", voiceId: "voice-1" },
    { id: "rachel", voiceId: "voice-2" },
  ],
}));

vi.mock("../avatar/VrmEngine", () => ({
  prefetchVrmToCache: (...args: unknown[]) => prefetchVrmToCacheMock(...args),
}));

vi.mock("./identity-preview-tts", () => ({
  buildPreviewTtsRequestPlans: () => [
    { endpoint: "/api/tts/preview", body: { text: "hello" } },
  ],
}));

import { primeOnboardingCharacterAssets } from "./onboarding-asset-preload";

describe("onboarding asset preload", () => {
  beforeEach(() => {
    fetchWithTimeoutMock.mockReset();
    prefetchVrmToCacheMock.mockReset();

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(8),
      })),
    );

    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      decoding = "async";

      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }

    vi.stubGlobal("Image", MockImage);
  });

  it("does not count bulk voice previews in the welcome preload session", async () => {
    const snapshot = await primeOnboardingCharacterAssets([
      {
        id: "chen",
        avatarIndex: 1,
        voicePresetId: "alice",
        catchphrase: "I can't wait!",
      } as never,
    ]);

    expect(snapshot.total).toBe(3);
    expect(snapshot.criticalTotal).toBe(3);
    expect(fetchWithTimeoutMock).not.toHaveBeenCalled();
    expect(prefetchVrmToCacheMock).toHaveBeenCalledTimes(1);
  });
});
