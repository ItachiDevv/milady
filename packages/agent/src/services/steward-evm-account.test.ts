import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  STEWARD_EVM_DUMMY_PRIVATE_KEY,
  hasUsableLocalEvmPrivateKey,
  isStewardCloudProvisioned,
} from "./steward-evm-account.js";

const ORIGINAL_ENV = { ...process.env };

describe("steward-evm-account env helpers", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.MILADY_CLOUD_PROVISIONED;
    delete process.env.ELIZA_CLOUD_PROVISIONED;
    delete process.env.STEWARD_AGENT_TOKEN;
    delete process.env.STEWARD_API_URL;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("accepts ELIZA_CLOUD_PROVISIONED for Steward cloud activation", () => {
    process.env.ELIZA_CLOUD_PROVISIONED = "1";
    process.env.STEWARD_AGENT_TOKEN = "agent-token";
    process.env.STEWARD_API_URL = "https://steward.example.com";

    expect(isStewardCloudProvisioned()).toBe(true);
  });

  it("ignores the injected Steward dummy key as a usable local signer", () => {
    expect(hasUsableLocalEvmPrivateKey(STEWARD_EVM_DUMMY_PRIVATE_KEY)).toBe(
      false,
    );
    expect(
      hasUsableLocalEvmPrivateKey(
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
      ),
    ).toBe(true);
  });
});
