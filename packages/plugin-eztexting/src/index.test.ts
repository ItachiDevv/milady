import { describe, expect, it, vi, beforeEach } from "vitest";
import { normalizePhoneNumber, resolveCredentials } from "./eztexting-client";
import type { EZTextingPluginConfig } from "./types";

describe("normalizePhoneNumber", () => {
  it("strips formatting from a US phone number", () => {
    expect(normalizePhoneNumber("(737) 372-5813")).toBe("7373725813");
  });

  it("strips +1 country code prefix", () => {
    expect(normalizePhoneNumber("+1-737-372-5813")).toBe("7373725813");
  });

  it("passes through a bare 10-digit number", () => {
    expect(normalizePhoneNumber("7373725813")).toBe("7373725813");
  });

  it("handles 11-digit with leading 1", () => {
    expect(normalizePhoneNumber("17373725813")).toBe("7373725813");
  });
});

describe("resolveCredentials", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.EZTEXTING_USERNAME;
    delete process.env.EZTEXTING_PASSWORD;
    delete process.env.EZTEXTING_PHONE_NUMBER;
  });

  it("returns null when config and env are empty", () => {
    expect(resolveCredentials({})).toBeNull();
  });

  it("resolves from explicit config", () => {
    const config: EZTextingPluginConfig = {
      username: "user1",
      password: "pass1",
      phoneNumber: "(737) 372-5813",
    };
    const creds = resolveCredentials(config);
    expect(creds).not.toBeNull();
    expect(creds!.username).toBe("user1");
    expect(creds!.password).toBe("pass1");
    expect(creds!.phoneNumber).toBe("7373725813");
    expect(creds!.baseUrl).toBe("https://app.eztexting.com");
  });

  it("resolves from environment variables", () => {
    process.env.EZTEXTING_USERNAME = "envuser";
    process.env.EZTEXTING_PASSWORD = "envpass";
    process.env.EZTEXTING_PHONE_NUMBER = "7373725813";

    const creds = resolveCredentials({});
    expect(creds).not.toBeNull();
    expect(creds!.username).toBe("envuser");
    expect(creds!.phoneNumber).toBe("7373725813");
  });

  it("returns null when password is missing", () => {
    const config: EZTextingPluginConfig = {
      username: "user1",
      phoneNumber: "7373725813",
    };
    expect(resolveCredentials(config)).toBeNull();
  });

  it("allows baseUrl override", () => {
    const config: EZTextingPluginConfig = {
      username: "user1",
      password: "pass1",
      phoneNumber: "7373725813",
      baseUrl: "https://staging.eztexting.com",
    };
    const creds = resolveCredentials(config);
    expect(creds!.baseUrl).toBe("https://staging.eztexting.com");
  });

  // Restore env after all tests
  afterAll(() => {
    process.env = originalEnv;
  });
});

describe("sendSmsAction", () => {
  it("is importable and has the expected name", async () => {
    const { sendSmsAction } = await import("./action");
    expect(sendSmsAction.name).toBe("SEND_SMS");
    expect(sendSmsAction.parameters).toBeDefined();
    expect(sendSmsAction.parameters!.length).toBeGreaterThan(0);
  });
});

describe("checkSmsStatusAction", () => {
  it("is importable and has the expected name", async () => {
    const { checkSmsStatusAction } = await import("./action");
    expect(checkSmsStatusAction.name).toBe("CHECK_SMS_STATUS");
  });
});

describe("eztextingProvider", () => {
  it("returns unavailable when not configured", async () => {
    // Ensure credentials are not set
    const { initCredentials, getCredentials } = await import("./state");
    initCredentials({});

    const { eztextingProvider } = await import("./provider");
    const result = await eztextingProvider.get(
      {} as any,
      {} as any,
      {} as any,
    );
    expect(result.text).toContain("not configured");
    expect(result.values?.eztextingAvailable).toBe(false);
  });
});

describe("plugin default export", () => {
  it("exports a valid Plugin object", async () => {
    const mod = await import("./index");
    const plugin = mod.default;
    expect(plugin.name).toBe("@miladyai/plugin-eztexting");
    expect(plugin.actions).toBeDefined();
    expect(plugin.providers).toBeDefined();
    expect(plugin.init).toBeDefined();
  });
});
