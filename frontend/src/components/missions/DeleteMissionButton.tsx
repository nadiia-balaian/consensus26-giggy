"use client";

import { useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteMission } from "@/lib/api/missions";

export function DeleteMissionButton({ missionId }: { missionId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick(e: MouseEvent<HTMLButtonElement>) {
    // Stop the parent <Link> from navigating
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;

    if (!confirm("Delete this mission? This removes the off-chain record only — the on-chain task is unaffected.")) {
      return;
    }

    setPending(true);
    try {
      await deleteMission(missionId);
      router.refresh();
    } catch (err) {
      alert(`Delete failed: ${err instanceof Error ? err.message : "unknown error"}`);
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label="Delete mission"
      title="Delete mission"
      className="absolute top-4 right-3 inline-flex size-8 items-center justify-center rounded-full border-ink-2 bg-white shadow-doodle-sm transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
