/**
 * SolidJS integration — signals store, React bridge, and island renderer.
 *
 * Architecture:
 * - store.ts: Standalone signals (no providers, no contexts)
 * - bridge.ts: useSolidSignal() for React components to read signals
 * - SolidIsland.tsx: Mount SolidJS components inside React tree
 * - *.solid.tsx: SolidJS components (compiled by vite-plugin-solid)
 */

export * from "./store";
export { useSolidSignal, useSolidStore } from "./bridge";
export { SolidIsland } from "./SolidIsland";
