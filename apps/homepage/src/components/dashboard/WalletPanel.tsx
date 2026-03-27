import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAgents, type ManagedAgent } from "../../lib/AgentProvider";
import type {
  WalletBalancesResponse,
  EvmChainBalance,
  SolanaTokenBalance,
} from "@miladyai/shared/contracts/wallet";

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

const CHAIN_EXPLORERS: Record<string, { label: string; addressUrl: (a: string) => string; txUrl: (h: string) => string; nativeSymbol: string }> = {
  ethereum: { label: "etherscan", nativeSymbol: "ETH", addressUrl: (a) => `https://etherscan.io/address/${a}`, txUrl: (h) => `https://etherscan.io/tx/${h}` },
  base: { label: "basescan", nativeSymbol: "ETH", addressUrl: (a) => `https://basescan.org/address/${a}`, txUrl: (h) => `https://basescan.org/tx/${h}` },
  avalanche: { label: "snowtrace", nativeSymbol: "AVAX", addressUrl: (a) => `https://snowtrace.io/address/${a}`, txUrl: (h) => `https://snowtrace.io/tx/${h}` },
  bsc: { label: "bscscan", nativeSymbol: "BNB", addressUrl: (a) => `https://bscscan.com/address/${a}`, txUrl: (h) => `https://bscscan.com/tx/${h}` },
};

const SOLANA_EXPLORER = {
  label: "solscan",
  addressUrl: (a: string) => `https://solscan.io/account/${a}`,
  txUrl: (h: string) => `https://solscan.io/tx/${h}`,
};

function evmExplorerLinks(address: string) {
  return Object.entries(CHAIN_EXPLORERS).map(([chain, info]) => ({
    chain,
    label: info.label,
    url: info.addressUrl(address),
  }));
}

function solExplorerUrl(address: string): string {
  return SOLANA_EXPLORER.addressUrl(address);
}

function txExplorerUrl(chain: string, txHash: string): { label: string; url: string } | null {
  if (chain === "solana") return { label: "solscan", url: SOLANA_EXPLORER.txUrl(txHash) };
  const info = CHAIN_EXPLORERS[chain];
  if (info) return { label: info.label, url: info.txUrl(txHash) };
  return null;
}

function totalUsd(balances: WalletBalancesResponse | null): number {
  if (!balances) return 0;
  let total = 0;
  if (balances.evm) {
    for (const chain of balances.evm.chains) {
      total += Number.parseFloat(chain.nativeValueUsd) || 0;
      for (const tok of chain.tokens ?? []) {
        total += Number.parseFloat(tok.valueUsd) || 0;
      }
    }
  }
  if (balances.solana) {
    total += Number.parseFloat(balances.solana.solValueUsd) || 0;
    for (const tok of balances.solana.tokens ?? []) {
      total += Number.parseFloat(tok.valueUsd) || 0;
    }
  }
  return total;
}

function evmTotalUsd(balances: WalletBalancesResponse | null): number {
  if (!balances?.evm) return 0;
  let total = 0;
  for (const chain of balances.evm.chains) {
    total += Number.parseFloat(chain.nativeValueUsd) || 0;
    for (const tok of chain.tokens ?? []) {
      total += Number.parseFloat(tok.valueUsd) || 0;
    }
  }
  return total;
}

function solTotalUsd(balances: WalletBalancesResponse | null): number {
  if (!balances?.solana) return 0;
  let total = Number.parseFloat(balances.solana.solValueUsd) || 0;
  for (const tok of balances.solana.tokens ?? []) {
    total += Number.parseFloat(tok.valueUsd) || 0;
  }
  return total;
}

function fmtUsd(v: string | number): string {
  const n = typeof v === "string" ? Number.parseFloat(v) : v;
  if (!n || Number.isNaN(n)) return "$0.00";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtUsdCompact(n: number): string {
  if (!n || Number.isNaN(n)) return "$0";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function timeAgo(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function chainBalance(chain: string, balances: WalletBalancesResponse | null): string {
  if (!balances) return "";
  if (chain === "solana" && balances.solana) {
    return `${balances.solana.solBalance} SOL`;
  }
  if (balances.evm) {
    const c = balances.evm.chains.find((ch) => ch.chain === chain);
    if (c) return `${c.nativeBalance} ${c.nativeSymbol}`;
  }
  return "—";
}

// ---------------------------------------------------------------------------
// types
// ---------------------------------------------------------------------------

type View = "overview" | "fund" | "generate" | "import" | "transfer";

// ---------------------------------------------------------------------------
// WalletPanel (public)
// ---------------------------------------------------------------------------

export function WalletPanel({ agentId }: { agentId?: string }) {
  const { agents } = useAgents();
  const agentsWithClient = useMemo(() => agents.filter((a) => a.client), [agents]);

  const [selectedId, setSelectedId] = useState<string | null>(agentId ?? null);

  // resolve selected agent
  const selected = useMemo(() => {
    if (selectedId) return agentsWithClient.find((a) => a.id === selectedId) ?? agentsWithClient[0] ?? null;
    return agentsWithClient[0] ?? null;
  }, [agentsWithClient, selectedId]);

  if (agentsWithClient.length === 0) {
    return (
      <div className="font-mono text-sm text-text-muted py-8">
        no agents with wallet access
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* agent selector */}
      {agentsWithClient.length > 1 && (
        <select
          value={selected?.id ?? ""}
          onChange={(e) => setSelectedId(e.target.value)}
          className="font-mono text-xs bg-transparent border border-border rounded px-2 py-1 text-text-light focus:outline-none focus:border-brand"
        >
          {agentsWithClient.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      )}

      {selected && selected.client ? (
        <WalletPanelInner key={selected.id} agent={selected} />
      ) : (
        <div className="font-mono text-sm text-text-muted py-8">
          select an agent to view wallet
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// WalletPanelInner
// ---------------------------------------------------------------------------

const AUTO_REFRESH_MS = 60_000;

function WalletPanelInner({ agent }: { agent: ManagedAgent }) {
  const [addresses, setAddresses] = useState<{
    evmAddress: string | null;
    solanaAddress: string | null;
  } | null>(agent.walletAddresses ?? null);
  const [balances, setBalances] = useState<WalletBalancesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [view, setView] = useState<View>("overview");
  const [lastRefreshed, setLastRefreshed] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    if (!agent.client) return;
    setLoading(true);
    setError(null);
    try {
      const [addr, bal] = await Promise.all([
        agent.client.getWalletAddresses().catch(() => null),
        agent.client.getWalletBalances().catch(() => null),
      ]);
      setAddresses(addr);
      setBalances(bal as WalletBalancesResponse | null);
      setLastRefreshed(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to load wallet");
    } finally {
      setLoading(false);
    }
  }, [agent.client]);

  // initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // auto-refresh every 60s
  useEffect(() => {
    refreshTimerRef.current = setInterval(() => {
      fetchData();
    }, AUTO_REFRESH_MS);
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [fetchData]);

  // tick "last refreshed" display every 10s
  useEffect(() => {
    tickRef.current = setInterval(() => setNow(Date.now()), 10_000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  const handleCopy = (addr: string, label: string) => {
    copyToClipboard(addr);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  const noWallet = !loading && !addresses?.evmAddress && !addresses?.solanaAddress;

  // action callbacks
  const onGenerated = () => { setView("overview"); void fetchData(); };
  const onImported = () => { setView("overview"); void fetchData(); };
  const onTransferred = () => { setView("overview"); void fetchData(); };

  const total = totalUsd(balances);
  const evmTotal = evmTotalUsd(balances);
  const solTotal = solTotalUsd(balances);

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-baseline gap-3">
        <h2 className="font-mono text-sm font-medium text-text-light">{agent.name}</h2>
        <span className="font-mono text-[10px] text-text-subtle tracking-wide">wallet</span>
      </div>

      {loading && <p className="font-mono text-xs text-text-muted">loading…</p>}
      {error && <p className="font-mono text-[11px] text-red-400">{error}</p>}

      {/* empty state */}
      {noWallet && !loading && view === "overview" && (
        <div className="py-6 space-y-4 text-center">
          <p className="font-mono text-sm text-text-muted">generate a wallet to get started</p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setView("generate")}
              className="font-mono text-xs text-text-light border border-brand rounded px-4 py-2 hover:bg-brand/10 transition-colors"
            >
              generate wallet
            </button>
            <button
              type="button"
              onClick={() => setView("import")}
              className="font-mono text-xs text-text-subtle border border-border rounded px-4 py-2 hover:border-brand transition-colors"
            >
              import wallet
            </button>
          </div>
        </div>
      )}

      {/* views */}
      {!loading && view === "fund" && addresses && (
        <FundView
          addresses={addresses}
          onBack={() => setView("overview")}
          onCopy={handleCopy}
          copied={copied}
        />
      )}

      {!loading && view === "generate" && agent.client && (
        <GenerateView client={agent.client} onDone={onGenerated} onBack={() => setView("overview")} />
      )}

      {!loading && view === "import" && agent.client && (
        <ImportView client={agent.client} onDone={onImported} onBack={() => setView("overview")} />
      )}

      {!loading && view === "transfer" && agent.client && addresses && (
        <TransferView
          client={agent.client}
          addresses={addresses}
          balances={balances}
          onDone={onTransferred}
          onBack={() => setView("overview")}
        />
      )}

      {!loading && view === "overview" && !noWallet && (
        <>
          {/* hero total */}
          <div>
            <span className="text-4xl font-mono tabular-nums tracking-tight text-text-light font-semibold">
              {fmtUsd(total)}
            </span>
            {(evmTotal > 0 || solTotal > 0) && (
              <div className="mt-1 font-mono text-xs text-text-muted tabular-nums">
                {evmTotal > 0 && <span>evm {fmtUsdCompact(evmTotal)}</span>}
                {evmTotal > 0 && solTotal > 0 && <span className="mx-1.5 text-text-subtle">·</span>}
                {solTotal > 0 && <span>sol {fmtUsdCompact(solTotal)}</span>}
              </div>
            )}
          </div>

          {/* addresses */}
          <AddressesSection
            addresses={addresses}
            onCopy={handleCopy}
            copied={copied}
          />

          {/* balances */}
          {balances && <BalancesSection balances={balances} />}

          {/* actions */}
          <div className="pt-3 border-t border-border">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {(addresses?.evmAddress || addresses?.solanaAddress) && (
                <ActionButton label="fund" onClick={() => setView("fund")} />
              )}
              <ActionButton label="generate wallet" onClick={() => setView("generate")} />
              <ActionButton label="import wallet" onClick={() => setView("import")} />
              {(addresses?.evmAddress || addresses?.solanaAddress) && (
                <ActionButton label="transfer" onClick={() => setView("transfer")} />
              )}
            </div>
          </div>

          {/* last refreshed */}
          <div className="flex items-center gap-3 pt-1">
            {lastRefreshed && (
              <span className="font-mono text-[10px] text-text-subtle">
                refreshed {timeAgo(now - lastRefreshed)}
              </span>
            )}
            <button
              type="button"
              onClick={() => fetchData()}
              className="font-mono text-[10px] text-text-subtle hover:text-text-light transition-colors"
            >
              ↻ refresh
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AddressesSection
// ---------------------------------------------------------------------------

function AddressesSection({
  addresses,
  onCopy,
  copied,
}: {
  addresses: { evmAddress: string | null; solanaAddress: string | null } | null;
  onCopy: (addr: string, label: string) => void;
  copied: string | null;
}) {
  if (!addresses) return null;
  return (
    <div className="space-y-2">
      <h3 className="font-mono text-[10px] tracking-wider text-text-subtle">ADDRESSES</h3>
      <dl className="space-y-0">
        {addresses.evmAddress && (
          <AddressRow
            label="EVM"
            address={addresses.evmAddress}
            explorerLinks={evmExplorerLinks(addresses.evmAddress)}
            onCopy={() => onCopy(addresses.evmAddress!, "evm")}
            isCopied={copied === "evm"}
          />
        )}
        {addresses.solanaAddress && (
          <AddressRow
            label="SOL"
            address={addresses.solanaAddress}
            explorerLinks={[{ chain: "solana", label: "solscan", url: solExplorerUrl(addresses.solanaAddress) }]}
            onCopy={() => onCopy(addresses.solanaAddress!, "sol")}
            isCopied={copied === "sol"}
          />
        )}
      </dl>
    </div>
  );
}

function AddressRow({
  label,
  address,
  explorerLinks,
  onCopy,
  isCopied,
}: {
  label: string;
  address: string;
  explorerLinks: Array<{ chain: string; label: string; url: string }>;
  onCopy: () => void;
  isCopied: boolean;
}) {
  return (
    <div className="py-2 border-b border-border-subtle last:border-0">
      <div className="flex items-baseline justify-between gap-4">
        <dt className="font-mono text-[10px] tracking-wider text-text-subtle flex-shrink-0">
          {label}
        </dt>
        <dd className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onCopy}
            className="font-mono text-[11px] text-text-light hover:text-brand transition-colors cursor-pointer break-all text-right"
            title="click to copy"
          >
            {isCopied ? "copied" : address}
          </button>
        </dd>
      </div>
      <div className="flex gap-2 mt-1 justify-end">
        {explorerLinks.map((link) => (
          <a
            key={link.chain}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] text-text-subtle hover:text-text-light transition-colors"
          >
            {link.label} ↗
          </a>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BalancesSection
// ---------------------------------------------------------------------------

function BalancesSection({ balances }: { balances: WalletBalancesResponse }) {
  return (
    <div className="space-y-2">
      <h3 className="font-mono text-[10px] tracking-wider text-text-subtle">BALANCES</h3>
      <div className="space-y-0">
        {balances.evm?.chains.map((chain) => (
          <ChainBalanceGroup key={chain.chain} chain={chain} />
        ))}
        {balances.solana && <SolanaBalanceGroup solana={balances.solana} />}
      </div>
    </div>
  );
}

function ChainBalanceGroup({ chain }: { chain: EvmChainBalance }) {
  const tokens = chain.tokens ?? [];
  const explorer = CHAIN_EXPLORERS[chain.chain];
  const nativeSymbol = explorer?.nativeSymbol ?? chain.nativeSymbol;
  return (
    <div>
      {/* native */}
      <div className="flex items-baseline justify-between gap-4 py-2 border-b border-border-subtle">
        <span className="font-mono text-xs text-text-light font-semibold">
          {chain.chain}
          <span className="text-text-muted font-normal ml-1.5">{nativeSymbol}</span>
        </span>
        <span className="font-mono text-xs text-text-light tabular-nums">
          {chain.nativeBalance} {chain.nativeSymbol}
          <span className="text-text-subtle ml-2">{fmtUsd(chain.nativeValueUsd)}</span>
        </span>
      </div>
      {/* tokens */}
      {tokens.map((tok) => (
        <div
          key={tok.contractAddress}
          className="flex items-baseline justify-between gap-4 py-1.5 border-b border-border-subtle pl-4"
        >
          <span className="font-mono text-[11px] text-text-subtle">{tok.symbol}</span>
          <span className="font-mono text-[11px] text-text-light tabular-nums">
            {tok.balance}
            <span className="text-text-subtle ml-2">{fmtUsd(tok.valueUsd)}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function SolanaBalanceGroup({
  solana,
}: {
  solana: NonNullable<WalletBalancesResponse["solana"]>;
}) {
  const tokens: SolanaTokenBalance[] = solana.tokens ?? [];
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 py-2 border-b border-border-subtle last:border-0">
        <span className="font-mono text-xs text-text-light font-semibold">
          solana
          <span className="text-text-muted font-normal ml-1.5">SOL</span>
        </span>
        <span className="font-mono text-xs text-text-light tabular-nums">
          {solana.solBalance} SOL
          <span className="text-text-subtle ml-2">{fmtUsd(solana.solValueUsd)}</span>
        </span>
      </div>
      {tokens.map((tok) => (
        <div
          key={tok.mint}
          className="flex items-baseline justify-between gap-4 py-1.5 border-b border-border-subtle pl-4"
        >
          <span className="font-mono text-[11px] text-text-subtle">{tok.symbol}</span>
          <span className="font-mono text-[11px] text-text-light tabular-nums">
            {tok.balance}
            <span className="text-text-subtle ml-2">{fmtUsd(tok.valueUsd)}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FundView
// ---------------------------------------------------------------------------

function FundView({
  addresses,
  onBack,
  onCopy,
  copied,
}: {
  addresses: { evmAddress: string | null; solanaAddress: string | null };
  onBack: () => void;
  onCopy: (addr: string, label: string) => void;
  copied: string | null;
}) {
  return (
    <div className="space-y-4">
      <BackButton onClick={onBack} />
      <h3 className="font-mono text-xs text-text-light">receive funds</h3>
      <p className="font-mono text-[11px] text-text-muted">
        send tokens to these addresses on the corresponding chain
      </p>

      {addresses.evmAddress && (
        <div className="space-y-2">
          <p className="font-mono text-[10px] tracking-wider text-text-subtle">EVM ADDRESS</p>
          <button
            type="button"
            onClick={() => onCopy(addresses.evmAddress!, "fund-evm")}
            className="font-mono text-sm text-text-light hover:text-brand transition-colors break-all text-left cursor-pointer w-full"
          >
            {copied === "fund-evm" ? "copied" : addresses.evmAddress}
          </button>
          <div className="flex flex-wrap gap-2">
            {evmExplorerLinks(addresses.evmAddress).map((link) => (
              <a
                key={link.chain}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] text-text-subtle hover:text-text-light transition-colors"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        </div>
      )}

      {addresses.solanaAddress && (
        <div className="space-y-2">
          <p className="font-mono text-[10px] tracking-wider text-text-subtle">SOLANA ADDRESS</p>
          <button
            type="button"
            onClick={() => onCopy(addresses.solanaAddress!, "fund-sol")}
            className="font-mono text-sm text-text-light hover:text-brand transition-colors break-all text-left cursor-pointer w-full"
          >
            {copied === "fund-sol" ? "copied" : addresses.solanaAddress}
          </button>
          <a
            href={solExplorerUrl(addresses.solanaAddress)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] text-text-subtle hover:text-text-light transition-colors"
          >
            solscan ↗
          </a>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// GenerateView
// ---------------------------------------------------------------------------

function GenerateView({
  client,
  onDone,
  onBack,
}: {
  client: NonNullable<ManagedAgent["client"]>;
  onDone: () => void;
  onBack: () => void;
}) {
  const [chain, setChain] = useState<"evm" | "solana" | "both">("both");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ evmAddress?: string; solanaAddress?: string } | null>(null);

  const handleGenerate = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await client.generateWallet(chain);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "generation failed");
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-3">
        <BackButton onClick={onDone} label="done" />
        <p className="font-mono text-xs text-text-light">wallet generated</p>
        {result.evmAddress && (
          <div>
            <p className="font-mono text-[10px] tracking-wider text-text-subtle">EVM</p>
            <p className="font-mono text-[11px] text-text-light break-all">{result.evmAddress}</p>
          </div>
        )}
        {result.solanaAddress && (
          <div>
            <p className="font-mono text-[10px] tracking-wider text-text-subtle">SOLANA</p>
            <p className="font-mono text-[11px] text-text-light break-all">{result.solanaAddress}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <BackButton onClick={onBack} />
      <h3 className="font-mono text-xs text-text-light">generate wallet</h3>
      <div className="flex items-center gap-3">
        <select
          value={chain}
          onChange={(e) => setChain(e.target.value as "evm" | "solana" | "both")}
          disabled={busy}
          className="font-mono text-xs bg-transparent border border-border rounded px-2 py-1 text-text-light focus:outline-none focus:border-brand disabled:opacity-50"
        >
          <option value="both">both</option>
          <option value="evm">evm only</option>
          <option value="solana">solana only</option>
        </select>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={busy}
          className="font-mono text-[11px] text-text-light border border-border rounded px-3 py-1 hover:border-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "generating…" : "generate"}
        </button>
      </div>
      {error && <p className="font-mono text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ImportView
// ---------------------------------------------------------------------------

function ImportView({
  client,
  onDone,
  onBack,
}: {
  client: NonNullable<ManagedAgent["client"]>;
  onDone: () => void;
  onBack: () => void;
}) {
  const [privateKey, setPrivateKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ chain: string; address: string } | null>(null);

  const handleImport = async () => {
    if (!privateKey.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await client.importWallet(privateKey.trim());
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "import failed");
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-3">
        <BackButton onClick={onDone} label="done" />
        <p className="font-mono text-xs text-text-light">wallet imported</p>
        <div>
          <p className="font-mono text-[10px] tracking-wider text-text-subtle">{result.chain.toUpperCase()}</p>
          <p className="font-mono text-[11px] text-text-light break-all">{result.address}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <BackButton onClick={onBack} />
      <h3 className="font-mono text-xs text-text-light">import wallet</h3>
      <input
        type="password"
        value={privateKey}
        onChange={(e) => setPrivateKey(e.target.value)}
        placeholder="private key"
        disabled={busy}
        className="w-full font-mono text-xs bg-transparent border border-border rounded px-2 py-1.5 text-text-light placeholder:text-text-subtle focus:outline-none focus:border-brand disabled:opacity-50"
      />
      <button
        type="button"
        onClick={handleImport}
        disabled={busy || !privateKey.trim()}
        className="font-mono text-[11px] text-text-light border border-border rounded px-3 py-1 hover:border-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? "importing…" : "import"}
      </button>
      {error && <p className="font-mono text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TransferView
// ---------------------------------------------------------------------------

function TransferView({
  client,
  addresses,
  balances,
  onDone,
  onBack,
}: {
  client: NonNullable<ManagedAgent["client"]>;
  addresses: { evmAddress: string | null; solanaAddress: string | null };
  balances: WalletBalancesResponse | null;
  onDone: () => void;
  onBack: () => void;
}) {
  // build chain options from addresses
  const chainOptions = useMemo(() => {
    const opts: string[] = [];
    if (addresses.evmAddress && balances?.evm) {
      for (const c of balances.evm.chains) opts.push(c.chain);
    }
    if (addresses.solanaAddress && balances?.solana) opts.push("solana");
    if (opts.length === 0) {
      if (addresses.evmAddress) opts.push("ethereum");
      if (addresses.solanaAddress) opts.push("solana");
    }
    return opts;
  }, [addresses, balances]);

  const [chain, setChain] = useState(chainOptions[0] ?? "ethereum");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [result, setResult] = useState<{ txHash?: string; error?: string } | null>(null);

  const handleSubmit = async () => {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await client.transferExecute({
        chain,
        to: to.trim(),
        amount: amount.trim(),
        token: token.trim() || undefined,
      });
      if (res.error) {
        setError(res.error);
        setConfirm(false);
      } else {
        setResult(res);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "transfer failed");
      setConfirm(false);
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    const txLink = result.txHash ? txExplorerUrl(chain, result.txHash) : null;
    return (
      <div className="space-y-3">
        <BackButton onClick={onDone} label="done" />
        <p className="font-mono text-xs text-text-light">transfer submitted</p>
        {result.txHash && (
          <div>
            {txLink ? (
              <a
                href={txLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] text-brand hover:text-brand/80 transition-colors break-all"
              >
                {txLink.label}: {result.txHash} ↗
              </a>
            ) : (
              <p className="font-mono text-[11px] text-text-muted break-all">tx: {result.txHash}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  const canSubmit = to.trim() && amount.trim() && !busy;

  return (
    <div className="space-y-3">
      <BackButton onClick={onBack} />
      <h3 className="font-mono text-xs text-text-light">transfer</h3>

      <select
        value={chain}
        onChange={(e) => { setChain(e.target.value); setConfirm(false); }}
        disabled={busy}
        className="w-full font-mono text-xs bg-transparent border border-border rounded px-2 py-1 text-text-light focus:outline-none focus:border-brand disabled:opacity-50"
      >
        {chainOptions.map((c) => (
          <option key={c} value={c}>
            {c} — {chainBalance(c, balances)}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={to}
        onChange={(e) => { setTo(e.target.value); setConfirm(false); }}
        placeholder="to address"
        disabled={busy}
        className="w-full font-mono text-xs bg-transparent border border-border rounded px-2 py-1.5 text-text-light placeholder:text-text-subtle focus:outline-none focus:border-brand disabled:opacity-50"
      />

      <div className="flex gap-2">
        <input
          type="text"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setConfirm(false); }}
          placeholder="amount"
          disabled={busy}
          className="flex-1 font-mono text-xs bg-transparent border border-border rounded px-2 py-1.5 text-text-light placeholder:text-text-subtle focus:outline-none focus:border-brand disabled:opacity-50"
        />
        <input
          type="text"
          value={token}
          onChange={(e) => { setToken(e.target.value); setConfirm(false); }}
          placeholder="token (optional)"
          disabled={busy}
          className="flex-1 font-mono text-xs bg-transparent border border-border rounded px-2 py-1.5 text-text-light placeholder:text-text-subtle focus:outline-none focus:border-brand disabled:opacity-50"
        />
      </div>

      {confirm && !busy && (
        <div className="font-mono text-[11px] text-text-muted border border-border rounded p-2 space-y-1">
          <p>sending {amount.trim()} {token.trim() || "native"} on {chain}</p>
          <p className="break-all">to: {to.trim()}</p>
          <p className="text-yellow-400">click transfer again to confirm</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="font-mono text-[11px] text-text-light border border-border rounded px-3 py-1 hover:border-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? "sending…" : confirm ? "confirm transfer" : "transfer"}
      </button>

      {error && <p className="font-mono text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared UI atoms
// ---------------------------------------------------------------------------

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-mono text-[11px] text-text-subtle hover:text-text-light transition-colors"
    >
      {label}
    </button>
  );
}

function BackButton({ onClick, label = "← back" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-mono text-[11px] text-text-subtle hover:text-text-light transition-colors"
    >
      {label}
    </button>
  );
}
