import { useCloudLogin } from "./useCloudLogin";

interface CloudLoginBannerProps {
  onAuthenticated?: () => void;
}

/**
 * Inline auth prompt — single-line banner, not a bordered box.
 * Renders as a subtle strip below the SourceBar when unauthenticated.
 */
export function CloudLoginBanner({ onAuthenticated }: CloudLoginBannerProps) {
  const { state, error, manualLoginUrl, signIn } = useCloudLogin({
    onAuthenticated,
  });

  if (state === "authenticated") return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 sm:px-5 md:px-8 py-1.5 border-b border-border-subtle text-[11px] font-mono">
      <span className="text-text-subtle">
        sign in for cloud agents
      </span>
      <button
        type="button"
        onClick={() => void signIn()}
        disabled={state === "polling" || state === "checking"}
        className="text-brand hover:text-brand-hover disabled:text-text-muted disabled:cursor-not-allowed transition-colors"
      >
        {state === "polling" ? "waiting…" : "sign in →"}
      </button>
      {error && (
        <span className="text-red-400">{error}</span>
      )}
      {manualLoginUrl && (
        <a
          href={manualLoginUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-subtle hover:text-text-light underline underline-offset-2"
        >
          open manually
        </a>
      )}
    </div>
  );
}
