import { describe, expect, it } from "vitest";
import { resolveBrowserWorkspaceMessageOrigin } from "./BrowserWorkspaceView";

describe("resolveBrowserWorkspaceMessageOrigin", () => {
  it("returns the origin when it matches the tab URL", () => {
    expect(
      resolveBrowserWorkspaceMessageOrigin(
        "https://example.com",
        "https://example.com/page",
      ),
    ).toBe("https://example.com");
  });

  it("returns the origin when no tab URL is provided", () => {
    expect(resolveBrowserWorkspaceMessageOrigin("https://example.com")).toBe(
      "https://example.com",
    );
  });

  it("returns null for empty-string origin", () => {
    expect(resolveBrowserWorkspaceMessageOrigin("")).toBeNull();
  });

  it('returns null for the literal string "null" (sandboxed iframe)', () => {
    expect(resolveBrowserWorkspaceMessageOrigin("null")).toBeNull();
  });

  it("rejects origin that doesn't match the tab URL (sandbox escape)", () => {
    // A malicious page using allow-same-origin could present the parent
    // origin. The tab URL check catches this mismatch.
    expect(
      resolveBrowserWorkspaceMessageOrigin(
        "https://evil.com",
        "https://legitimate-dapp.com/swap",
      ),
    ).toBeNull();
  });

  it("rejects when tab URL is malformed", () => {
    expect(
      resolveBrowserWorkspaceMessageOrigin("https://example.com", "not-a-url"),
    ).toBeNull();
  });

  it("allows matching origin with different path", () => {
    expect(
      resolveBrowserWorkspaceMessageOrigin(
        "https://app.uniswap.org",
        "https://app.uniswap.org/#/swap?chain=ethereum",
      ),
    ).toBe("https://app.uniswap.org");
  });

  it("never returns wildcard for null-origin frames", () => {
    expect(resolveBrowserWorkspaceMessageOrigin("")).not.toBe("*");
    expect(resolveBrowserWorkspaceMessageOrigin("null")).not.toBe("*");
  });
});
