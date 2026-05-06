"use client";

import { useState } from "react";
import { Bot, Sparkles, Zap } from "lucide-react";
import type { AgentSnapshot } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/StatusBadge";
import { StatCard } from "@/components/agent/StatCard";
import { AgentDecisionTable } from "@/components/agent/AgentDecisionTable";
import { runAgentScan } from "@/lib/api/agent";
import { formatUsdSigned } from "@/lib/utils";

type Banner = { tone: "mint" | "yellow"; text: string } | null;

function fmtSeconds(s: number): string {
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export function AgentDashboardClient({
  initialSnapshot,
}: {
  initialSnapshot: AgentSnapshot;
}) {
  const [snapshot, setSnapshot] = useState<AgentSnapshot>(initialSnapshot);
  const [scanning, setScanning] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  async function onScan() {
    if (scanning) return;
    setScanning(true);
    setBanner(null);
    // Demo-only: production runs on AWS EventBridge cron, not via this button.
    // TODO Backend: when wiring to real backend, leave this UI control behind
    // a `NEXT_PUBLIC_DEMO=true` flag so it isn't shown in production.
    const { snapshot: next, claimedMission } = await runAgentScan();
    setSnapshot(next);
    setBanner(
      claimedMission
        ? { tone: "mint", text: `Agent claimed: ${claimedMission.title}` }
        : { tone: "yellow", text: "Scan complete — no profitable missions to claim." },
    );
    setScanning(false);
    setTimeout(() => setBanner(null), 5000);
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">
            Agent Dashboard
          </h1>
          <p className="mt-1 text-sm text-ink/70">
            Real-time AWS Cron Agent Decision Engine
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={snapshot.online ? "mint" : "muted"}>
            <Bot className="size-3.5" />
            {snapshot.online ? "Agent Online" : "Agent Offline"}
          </Badge>
          <Button onClick={onScan} disabled={scanning} variant="primary" size="md">
            <Zap className="size-4 stroke-[3]" />
            {scanning ? "Scanning..." : "Run Agent Scan"}
          </Button>
        </div>
      </header>

      {banner ? (
        <div
          className={`flex items-center gap-2 rounded-2xl border-ink-3 px-4 py-3 shadow-doodle-sm ${
            banner.tone === "mint" ? "bg-mint" : "bg-yellow"
          }`}
        >
          <Sparkles className="size-4" />
          <span className="text-sm font-semibold">{banner.text}</span>
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          tone="sky"
          label="Last Scan Time"
          value={fmtSeconds(snapshot.lastScanSecondsAgo)}
        />
        <StatCard
          tone="coral"
          label="Missions Scanned"
          value={snapshot.missionsScanned.toLocaleString()}
        />
        <StatCard
          tone="yellow"
          label="Missions Claimed"
          value={snapshot.missionsClaimed.toLocaleString()}
        />
        <StatCard
          tone="mint"
          label="Expected Value"
          value={formatUsdSigned(snapshot.expectedValueUsd)}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold">Recent Decision Logic</h2>
        <p className="-mt-3 text-xs text-ink/60">
          EV = Reward − x402 Claim Cost − estimated cost / risk
        </p>
        <AgentDecisionTable decisions={snapshot.decisions} />
      </section>
    </div>
  );
}
