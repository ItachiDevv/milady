What I changed

- Inspected the cloud/main Discord path across connector config routing, onboarding token persistence, runtime env propagation, Discord application ID auto-resolution, and slash-command registration hooks.
- Implemented one safe behavior fix: Discord plugin validation now matches runtime behavior.
- `DISCORD_BOT_TOKEN` now satisfies validation anywhere `DISCORD_API_TOKEN` is the declared key.
- `DISCORD_APPLICATION_ID` is no longer treated as a hard blocker when a Discord bot token is present, because runtime startup auto-resolves it from Discord's OAuth2 API.
- Added focused regression tests covering both cases.

Open Discord risks / gaps

- There is still no cloud-path end-to-end test proving Discord slash commands register and work after token-only setup in a provisioned cloud container.
- Slash command registration in `packages/agent/src/runtime/eliza-plugin.ts` still depends on `@elizaos/plugin-commands` being present and the deferred skill registration succeeding; there is no targeted regression test around that startup sequence.
- The live Discord connector test file is mostly scaffold coverage plus TODOs, so message flow, auth failures, and native command behavior are not well protected.

Exact commit SHA

- `3fd0c490d02d7133cf8f5b17c59b31be03a61ca9`

Suggested next step

- Add one focused cloud Discord integration test that provisions only a bot token, verifies `/api/plugins` and startup validation report Discord healthy, and confirms slash-command registration after `autoResolveDiscordAppId()` runs.
