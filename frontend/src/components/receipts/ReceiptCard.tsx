import type { Receipt } from "@/types";
import { Badge } from "@/components/ui/StatusBadge";
import { formatUsd } from "@/lib/utils";

function Dotted() {
  return <div className="my-4 border-t-2 border-dashed border-ink/60" />;
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[150px_1fr] items-baseline gap-3">
      <span className="text-[0.7rem] font-bold uppercase tracking-wider text-ink/70">
        {label}
      </span>
      <span
        className={
          mono
            ? "font-mono text-sm break-all"
            : "text-sm font-medium leading-snug"
        }
      >
        {value}
      </span>
    </div>
  );
}

export function ReceiptCard({ receipt }: { receipt: Receipt }) {
  return (
    <article className="relative mx-auto w-full max-w-xl rounded-3xl border-ink-3 bg-yellow p-7 shadow-doodle-lg">
      <div className="absolute -top-3 left-6 inline-flex items-center gap-2 rounded-full border-ink-2 bg-cream px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider shadow-doodle-sm">
        Receipt #{receipt.id.toUpperCase()}
      </div>

      <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight">
        Mission Complete
      </h2>
      <p className="mt-1 text-sm font-medium">{receipt.missionTitle}</p>

      <Dotted />

      <div className="flex flex-col gap-3">
        <Row
          label="Agent Deliverable"
          value={
            <span className="inline-flex items-center gap-2">
              <span className="font-mono">{receipt.deliverableName}</span>
              <Badge tone="mint">Accepted</Badge>
            </span>
          }
        />
        <Row
          label="AWS Review Score"
          value={
            <span className="inline-flex items-center gap-2">
              <span className="font-display text-base font-extrabold">
                {receipt.review.score} / 100
              </span>
              <Badge tone="white">Rank: {receipt.review.rank}</Badge>
            </span>
          }
        />
        <Row label="Approval Reason" value={receipt.review.reason} />
      </div>

      <Dotted />

      <div className="flex flex-col gap-3">
        <Row label="x402 / Base Proof" value={receipt.x402TxHash} mono />
        <Row label="Gas Used" value={receipt.gasUsed} mono />
        <Row
          label="Payout Status"
          value={
            <span className="inline-flex items-center gap-2">
              <span className="font-mono">Sent to Wallet ({receipt.payoutWalletMasked})</span>
              <Badge tone="mint">
                {receipt.payoutStatus === "confirmed" ? "Confirmed" : "Pending"}
              </Badge>
            </span>
          }
        />
      </div>

      <Dotted />

      <div className="flex items-baseline justify-between">
        <span className="font-display text-xl font-bold">Total Payout</span>
        <span className="font-display text-3xl font-extrabold">
          {formatUsd(receipt.totalPayoutUsd)}
        </span>
      </div>
    </article>
  );
}
