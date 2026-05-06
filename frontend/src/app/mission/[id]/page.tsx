import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Wallet } from "lucide-react";
import { getMissionById, getMissionReport } from "@/lib/api/missions";
import { LifecycleTimeline } from "@/components/missions/LifecycleTimeline";
import {
  Badge,
  MissionStatusBadge,
  WorkerTypeBadge,
} from "@/components/ui/StatusBadge";
import { formatUsd } from "@/lib/utils";
import { ApproveAction } from "./ApproveAction";
import { DownloadReportButton } from "@/components/missions/DownloadReportButton";

export default async function MissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mission = await getMissionById(id);
  if (!mission) notFound();

  // Fetch the agent's report when the mission has reached submitted+ states.
  const reportStates = new Set(["submitted", "reviewing", "paid"]);
  const report = reportStates.has(mission.status)
    ? await getMissionReport(id)
    : null;

  const showApprove =
    mission.status === "submitted" || mission.status === "reviewing";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border-ink-2 bg-white px-4 py-1.5 text-sm font-semibold shadow-doodle-sm press press-hover"
        >
          <ArrowLeft className="size-4" />
          Back to Market
        </Link>
      </div>

      {/* Hero */}
      <section className="rounded-3xl border-ink-3 bg-sky p-7 shadow-doodle">
        <div className="flex flex-wrap items-center gap-2">
          <WorkerTypeBadge workerType={mission.workerType} />
          <MissionStatusBadge status={mission.status} />
          {mission.status === "open" ? (
            <Badge tone="yellow">Apply for this gig</Badge> 
          ) : null}
        </div>
        <h1 className="mt-5 font-display text-5xl font-extrabold leading-tight tracking-tight">
          {mission.title}
        </h1>
        <p className="mt-2 text-base font-semibold">
          Reward: {formatUsd(mission.rewardUsd)}
        </p>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_22rem]">
        {/* Left column: description + requirements */}
        <div className="flex flex-col gap-6">
          <section className="select-text rounded-3xl border-ink-3 bg-white p-7 shadow-doodle">
            <h2 className="font-display text-2xl font-bold">Mission Description</h2>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/80">
              {mission.description}
            </p>

            {mission.requirements.length > 0 ? (
              <>
                <h3 className="mt-6 font-display text-xl font-bold">Requirements</h3>
                <ul className="mt-3 list-disc pl-5 text-[0.95rem] leading-relaxed text-ink/80">
                  {mission.requirements.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>

          {mission.claimedBy ? (
            <section className="rounded-3xl border-ink-3 bg-cream p-6 shadow-doodle">
              <h3 className="font-display text-lg font-bold">Worker / Agent</h3>
              <p className="mt-1 font-mono text-sm">{mission.claimedBy}</p>
              {mission.x402TxHash ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge tone="white">
                    <Wallet className="size-3" />
                    x402 Proof
                  </Badge>
                  <span className="font-mono text-sm break-all">
                    {mission.x402TxHash}
                  </span>
                </div>
              ) : null}
            </section>
          ) : null}

          {report ? (
            <section className="select-text rounded-3xl border-ink-3 bg-white p-7 shadow-doodle">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="size-5" />
                  <h2 className="font-display text-2xl font-bold">Deliverable</h2>
                </div>
                <DownloadReportButton body={report.body} title={mission.title} />
              </div>
              <pre className="mt-4 whitespace-pre-wrap font-sans text-[0.95rem] leading-relaxed text-ink/85">
                {report.body}
              </pre>
              <p className="mt-6 break-all border-t border-dashed border-ink/30 pt-3 font-mono text-xs text-ink/60">
                report hash · {report.reportHash}
              </p>
            </section>
          ) : null}
        </div>

        {/* Right column: lifecycle + admin note + approve */}
        <aside className="flex flex-col gap-6">
          <section className="rounded-3xl border-ink-3 bg-white p-6 shadow-doodle">
            <h2 className="mb-4 font-display text-2xl font-bold">Lifecycle</h2>
            <LifecycleTimeline mission={mission} />
            {showApprove ? <ApproveAction missionId={mission.id} /> : null}
          </section>

          {mission.adminNote ? (
            <section className="rounded-3xl border-ink-3 bg-yellow p-6 shadow-doodle">
              <h3 className="font-display text-lg font-bold">Admin Note</h3>
              <p className="mt-2 text-sm leading-relaxed">{mission.adminNote}</p>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
