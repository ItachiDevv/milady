/** @jsxImportSource solid-js */

/**
 * Chat avatar panel — renders a 3D VRM avatar within the parent container.
 * SolidJS port of components/ChatAvatar.tsx
 */

import {
  createSignal,
  createEffect,
  onCleanup,
  Show,
} from "solid-js";
import {
  APP_EMOTE_EVENT,
  type AppEmoteEventDetail,
  STOP_EMOTE_EVENT,
} from "@miladyai/app-core/events";
import { getVrmPreviewUrl, getVrmUrl } from "../../state/vrm";
import { resolveAppAssetUrl } from "@miladyai/app-core/utils";

// TODO: import solid ports of AvatarLoader and VrmViewer when available.
// For now provide lightweight stubs so the file compiles cleanly.
function AvatarLoader() {
  return (
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  );
}

// VrmEngine types mirrored from the React original.
interface VrmEngine {
  playEmote(path: string, duration: number, loop: boolean): Promise<void>;
  stopEmote(): void;
}

interface VrmEngineState {
  vrmLoaded?: boolean;
  loadError?: boolean;
}

interface VrmViewerProps {
  vrmPath: string;
  mouthOpen: number;
  isSpeaking: boolean;
  interactive?: boolean;
  interactiveMode?: string;
  onEngineReady?: (engine: VrmEngine) => void;
  onEngineState?: (state: VrmEngineState) => void;
}

// TODO: replace with solid port of VrmViewer when available.
function VrmViewer(_props: VrmViewerProps) {
  return <div class="absolute inset-0" />;
}

export interface ChatAvatarProps {
  /** Mouth openness value (0–1) for lip sync animation */
  mouthOpen?: number;
  /** Whether the agent is currently speaking */
  isSpeaking?: boolean;
  /** Selected VRM index from the character store */
  selectedVrmIndex: number;
  /** Custom VRM URL if the user uploaded their own model */
  customVrmUrl: string;
}

export function ChatAvatar(props: ChatAvatarProps) {
  // Resolve VRM path from selected index or custom upload.
  const vrmPath = () =>
    props.selectedVrmIndex === 0 && props.customVrmUrl
      ? props.customVrmUrl
      : getVrmUrl(props.selectedVrmIndex || 1);

  const fallbackPreviewUrl = () =>
    props.selectedVrmIndex > 0
      ? getVrmPreviewUrl(props.selectedVrmIndex)
      : getVrmPreviewUrl(1);

  let vrmEngineRef: VrmEngine | null = null;
  const [engineReady, setEngineReady] = createSignal(false);
  const [vrmLoaded, setVrmLoaded] = createSignal(false);
  const [showFallback, setShowFallback] = createSignal(false);

  const avatarVisible = () => engineReady() || vrmLoaded() || showFallback();

  const handleEngineReady = (engine: VrmEngine) => {
    vrmEngineRef = engine;
    setEngineReady(true);
  };

  const handleEngineState = (state: VrmEngineState) => {
    if (state.vrmLoaded) {
      setVrmLoaded(true);
      setShowFallback(false);
      return;
    }
    if (state.loadError) {
      setVrmLoaded(false);
      setShowFallback(true);
    }
  };

  // Reset loading UI when the requested VRM changes.
  createEffect(() => {
    // Track vrmPath reactively.
    vrmPath();
    setVrmLoaded(false);
    setShowFallback(false);
  });

  // Listen for emote events once the engine is ready.
  createEffect(() => {
    if (!engineReady()) return;

    const handler = (event: Event) => {
      const engine = vrmEngineRef;
      if (!engine) return;
      const detail = (event as CustomEvent<AppEmoteEventDetail>).detail;
      if (!detail?.path) return;
      const resolvedPath = resolveAppAssetUrl(detail.path);
      const duration =
        typeof detail.duration === "number" && Number.isFinite(detail.duration)
          ? detail.duration
          : 3;
      const isLoop = detail.loop === true;
      void engine.playEmote(resolvedPath, duration, isLoop);
    };

    window.addEventListener(APP_EMOTE_EVENT, handler);
    onCleanup(() => window.removeEventListener(APP_EMOTE_EVENT, handler));
  });

  // Listen for stop-emote events from the EmotePicker control panel.
  createEffect(() => {
    if (!engineReady()) return;

    const handler = () => {
      vrmEngineRef?.stopEmote();
    };

    document.addEventListener(STOP_EMOTE_EVENT, handler);
    onCleanup(() => document.removeEventListener(STOP_EMOTE_EVENT, handler));
  });

  return (
    <div class="relative h-full w-full">
      <div
        class="absolute inset-0"
        style={{
          opacity: avatarVisible() ? 0.95 : 0,
          transition: "opacity 0.45s ease-in-out",
          background:
            "radial-gradient(circle at 50% 100%, rgba(255,255,255,0.08), transparent 60%)",
        }}
      >
        <div class="absolute inset-0 overflow-hidden">
          <div
            class="absolute inset-0"
            style={{
              opacity: vrmLoaded() ? 1 : 0,
              transition: "opacity 0.45s ease",
              transform: "scale(1.02) translateY(1%)",
              "transform-origin": "50% 42%",
            }}
          >
            <VrmViewer
              vrmPath={vrmPath()}
              mouthOpen={props.mouthOpen ?? 0}
              isSpeaking={props.isSpeaking ?? false}
              interactive
              interactiveMode="orbitZoom"
              onEngineReady={handleEngineReady}
              onEngineState={handleEngineState}
            />
          </div>

          <Show when={showFallback() && !vrmLoaded()}>
            <img
              src={fallbackPreviewUrl()}
              alt="avatar preview"
              class="absolute left-1/2 -translate-x-1/2 bottom-[-2%] h-[122%] object-contain opacity-90"
            />
          </Show>

          <Show when={!vrmLoaded() && !showFallback()}>
            <AvatarLoader />
          </Show>
        </div>
      </div>
    </div>
  );
}
