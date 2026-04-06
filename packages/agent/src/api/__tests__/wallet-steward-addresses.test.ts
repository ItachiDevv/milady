import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getWalletAddresses,
  MANAGED_EVM_ADDRESS_ENV_KEY,
} from "../wallet.js";
import { STEWARD_EVM_DUMMY_PRIVATE_KEY } from "../../services/steward-evm-account.js";

const ORIGINAL_ENV = { ...process.env };

describe("getWalletAddresses with Steward-managed env", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.EVM_PRIVATE_KEY;
    delete process.env[MANAGED_EVM_ADDRESS_ENV_KEY];
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("prefers the managed EVM address over the Steward dummy key", () => {
    process.env.EVM_PRIVATE_KEY = STEWARD_EVM_DUMMY_PRIVATE_KEY;
    process.env[MANAGED_EVM_ADDRESS_ENV_KEY] =
      "0x4444444444444444444444444444444444444444";

    expect(getWalletAddresses()).toEqual({
      evmAddress: "0x4444444444444444444444444444444444444444",
      solanaAddress: null,
    });
  });
});
