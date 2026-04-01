import { client } from "../api";

function getSearchParams(): URLSearchParams {
  if (typeof window === "undefined") {
    return new URLSearchParams();
  }

  return new URLSearchParams(
    window.location.search || window.location.hash.split("?")[1] || "",
  );
}

function isAllowedHttpHost(host: string): boolean {
  return (
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host) ||
    /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d{1,3}\.\d{1,3}$/.test(host) ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".ts.net") ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1"
  );
}

function normalizeLaunchApiBase(apiBase: string): string {
  const trimmed = apiBase.trim();
  if (!trimmed) {
    throw new Error("Missing launch API base");
  }

  try {
    const parsed = new URL(trimmed);
    if (
      parsed.protocol === "https:" ||
      (parsed.protocol === "http:" && isAllowedHttpHost(parsed.hostname))
    ) {
      return parsed.toString().replace(/\/+$/, "");
    }
    throw new Error(`Rejected launch apiBase protocol: ${parsed.protocol}`);
  } catch {
    if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
      return trimmed.replace(/\/+$/, "") || "/";
    }
    throw new Error("Rejected invalid launch apiBase");
  }
}

function normalizeLaunchBaseUrl(baseUrl: string): string {
  const parsed = new URL(baseUrl);
  if (parsed.protocol !== "https:" && !isAllowedHttpHost(parsed.hostname)) {
    throw new Error("Rejected invalid cloud launch base");
  }
  parsed.pathname = "";
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString().replace(/\/+$/, "");
}

function stripLaunchParams(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  for (const key of [
    "apiBase",
    "token",
    "cloudLaunchSession",
    "cloudLaunchBase",
  ]) {
    url.searchParams.delete(key);
  }
  window.history.replaceState({}, "", url.toString());
}

async function exchangeCloudLaunchSession(
  cloudBaseUrl: string,
  sessionId: string,
): Promise<{ apiBase: string; token: string }> {
  const sessionPath = encodeURIComponent(sessionId);
  const launchSessionUrls = [
    `${cloudBaseUrl}/api/v1/milady/launch-sessions/${sessionPath}`,
    `${cloudBaseUrl}/api/v1/eliza/launch-sessions/${sessionPath}`,
  ];

  let lastError: Error | null = null;

  for (const url of launchSessionUrls) {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      redirect: "manual",
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      lastError = new Error(
        payload.error ||
          `Launch session exchange failed (HTTP ${response.status})`,
      );

      if (response.status === 404) {
        continue;
      }
      throw lastError;
    }

    const payload = (await response.json()) as {
      success?: boolean;
      data?: {
        connection?: { apiBase?: string; token?: string };
      };
      error?: string;
    };

    if (!payload.success || !payload.data?.connection?.apiBase) {
      throw new Error(payload.error || "Launch session payload is invalid");
    }

    const token = payload.data.connection.token?.trim();
    if (!token) {
      throw new Error("Launch session did not include an access token");
    }

    return {
      apiBase: normalizeLaunchApiBase(payload.data.connection.apiBase),
      token,
    };
  }

  throw lastError ?? new Error("Launch session exchange failed");
}

/**
 * Exchange a one-time cloud pairing token for the agent's inbound API token.
 *
 * WHY: When the Eliza Cloud dashboard opens the Web UI via the pairing-token
 * flow, the browser lands on `https://<agentId>.waifu.fun/pair?token=<oneTimeToken>`.
 * The SPA has no API token yet — the one-time token must be exchanged at the
 * cloud's /api/auth/pair endpoint (which validates origin + token against the DB)
 * to obtain the agent's persistent MILADY_API_TOKEN.  Without this exchange every
 * authenticated API call fails with 401, leaving the browser in a perpetual
 * loading state or showing a startup error.
 */
async function exchangeCloudPairingToken(
  oneTimeToken: string,
  cloudApiBase: string,
): Promise<string | null> {
  if (!oneTimeToken || !cloudApiBase) return null;

  const origin =
    typeof window !== "undefined" ? window.location.origin : null;
  if (!origin) return null;

  try {
    const response = await fetch(`${cloudApiBase}/api/auth/pair`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: origin,
      },
      body: JSON.stringify({ token: oneTimeToken }),
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) return null;

    const payload = (await response.json().catch(() => null)) as {
      apiKey?: string | null;
    } | null;

    const apiKey = payload?.apiKey?.trim();
    return apiKey || null;
  } catch {
    // Non-fatal — caller will fall through to unauthenticated startup.
    return null;
  }
}

export async function applyLaunchConnectionFromUrl(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const params = getSearchParams();
  const launchSession = params.get("cloudLaunchSession")?.trim();
  const launchBase = params.get("cloudLaunchBase")?.trim();

  if (launchSession && launchBase) {
    const connection = await exchangeCloudLaunchSession(
      normalizeLaunchBaseUrl(launchBase),
      launchSession,
    );
    client.setBaseUrl(connection.apiBase);
    client.setToken(connection.token);
    stripLaunchParams();
    return true;
  }

  const apiBase = params.get("apiBase")?.trim();
  if (!apiBase) {
    // No explicit API base — check for a cloud pairing token.
    // This covers the Eliza Cloud dashboard "Open Web UI" flow where the
    // browser lands on `https://<agentId>.waifu.fun/pair?token=<oneTimeToken>`.
    // The one-time token must be exchanged at the cloud's /api/auth/pair
    // endpoint to obtain the agent's inbound API key.
    const pairToken = params.get("token")?.trim();
    if (pairToken) {
      // Read the cloud API base from a window global injected by the host
      // app, falling back to the production default. Avoids importing the
      // React-heavy boot-config module inside this platform utility.
      const injectedCloudBase =
        typeof window !== "undefined"
          ? (
              (window as Record<string, unknown>)
                .__ELIZA_CLOUD_API_BASE__ as string | undefined
            )?.trim()
          : undefined;
      const cloudApiBase = (
        injectedCloudBase ?? "https://www.elizacloud.ai"
      ).replace(/\/+$/, "");
      const agentApiKey = await exchangeCloudPairingToken(
        pairToken,
        cloudApiBase,
      );
      if (agentApiKey) {
        client.setToken(agentApiKey);
        // Strip the one-time token from the URL so a reload does not
        // attempt to re-exchange an already-consumed token.
        const url = new URL(window.location.href);
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.toString());
        return true;
      }
    }
    return false;
  }

  client.setBaseUrl(normalizeLaunchApiBase(apiBase));
  client.setToken(params.get("token")?.trim() || null);
  stripLaunchParams();
  return true;
}
