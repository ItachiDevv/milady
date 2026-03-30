/**
 * Packaged-style routing: `file://` + hash path (see AppContext hashchange handler).
 *
 * Requires `apps/app/dist/index.html` from `bun run build` (or `cd apps/app && bun run build`).
 * Run: `bun run test:ui:testcafe:packaged` (or set MILADY_TESTCAFE_FIXTURE to this path).
 *
 * Skips gracefully when dist is missing so CI without a web build does not fail.
 *
 * skipJsErrors() — intentional: file:// + Hammerhead often triggers security or
 * script errors unrelated to routing under test; we assert protocol, #root, and
 * onboarding URL. See smoke.testcafe.js header for the full rationale.
 */
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const { Selector, ClientFunction, RequestMock } = require("testcafe");

const distIndex = path.resolve(__dirname, "../../dist/index.html");

const onboardingMock = RequestMock()
  .onRequestTo(/\/api\/onboarding\/status/)
  .respond({ complete: true }, 200, { "content-type": "application/json" })
  .onRequestTo(/\/api\/agent\/status/)
  .respond({ onboardingComplete: true, status: "running" }, 200, {
    "content-type": "application/json",
  });

const getProtocol = ClientFunction(() => window.location.protocol);
const getHref = ClientFunction(() => window.location.href);

// Note: localStorage seeding must happen on the same origin as the file:// URL.
// We rely on requestHooks (onboardingMock) to bypass onboarding; localStorage
// is seeded after navigating to the file:// origin inside each test.
fixture`Packaged hash routing (file protocol)`.page`about:blank`.requestHooks(
  onboardingMock,
);

// skipJsErrors: see file header.
test.skipJsErrors()(
  "dist exists — file URL with hash navigates (packaged parity)",
  async (t) => {
    if (!fs.existsSync(distIndex)) {
      console.warn(
        "[testcafe] Skip: apps/app/dist/index.html missing — run `cd apps/app && bun run build`",
      );
      await t.expect(true).ok();
      return;
    }

    const fileBase = pathToFileURL(distIndex).href;
    const target = `${fileBase}#/settings`;

    await t.navigateTo(target);

    const root = Selector("#root");
    await t
      .expect(root.with({ timeout: 20000 }).exists)
      .ok("#root should exist on file:// + hash");

    await t
      .expect(getProtocol())
      .eql("file:", "Should use file protocol");

    await t
      .expect(getHref())
      .notContains("onboarding", "Should not land on onboarding URL hash");
  },
);
