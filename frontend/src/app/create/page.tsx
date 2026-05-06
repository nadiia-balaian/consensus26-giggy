"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { createMission } from "@/lib/api/missions";
import type { CreateMissionInput, WorkerType } from "@/types";

const WORKER_OPTIONS: { value: WorkerType; label: string }[] = [
  { value: "any", label: "Any Available Worker" },
  { value: "aws_agent", label: "AWS Agent Only" },
  { value: "human", label: "Human Only" },
];

export default function CreateMissionPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CreateMissionInput>({
    title: "",
    description: "",
    rewardUsd: 0,
    x402ClaimPriceUsd: 0,
    workerType: "any",
    deadline: "",
    successCriteria: "",
  });

  function update<K extends keyof CreateMissionInput>(
    key: K,
    value: CreateMissionInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    // TODO Backend: replace `createMission` with `POST /api/missions`. Server
    // should escrow the reward and return the persisted Mission.
    const mission = await createMission(form);
    router.push(`/mission/${mission.id}`);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          Create New Mission
        </h1>
        <p className="mt-1 text-sm text-ink/70">
          Deploy human intelligence or AI agents to your task.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="rounded-3xl border-ink-3 bg-coral p-8 shadow-doodle-lg"
      >
        <div className="flex flex-col gap-5">
          <Input
            label="Mission Title"
            placeholder="e.g., Audit Smart Contract for logic flaws"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
          />

          <Textarea
            label="Task Description"
            placeholder="Define the scope, required tools, and specific steps to follow..."
            rows={5}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            required
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              label="Reward Amount (USD)"
              type="number"
              min={0}
              step={1}
              placeholder="0.00"
              value={form.rewardUsd || ""}
              onChange={(e) => update("rewardUsd", Number(e.target.value))}
              required
            />
            <Input
              label="x402 Claim Price"
              type="number"
              min={0}
              step={1}
              placeholder="Price to access mission"
              value={form.x402ClaimPriceUsd || ""}
              onChange={(e) =>
                update("x402ClaimPriceUsd", Number(e.target.value))
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Select
              label="Worker Type Preference"
              options={WORKER_OPTIONS}
              value={form.workerType}
              onChange={(e) =>
                update("workerType", e.target.value as WorkerType)
              }
            />
            <Input
              label="Mission Deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => update("deadline", e.target.value)}
              required
            />
          </div>

          <Textarea
            label="Approval / Success Criteria"
            placeholder="e.g., PDF Report must contain at least 3 valid findings"
            rows={3}
            value={form.successCriteria}
            onChange={(e) => update("successCriteria", e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting}
            className="mt-2 w-full"
          >
            {submitting ? "Funding mission..." : "Fund & Create Mission"}
          </Button>
        </div>
      </form>
    </div>
  );
}
