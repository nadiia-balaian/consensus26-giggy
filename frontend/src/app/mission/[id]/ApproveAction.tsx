"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { reviewDeliverable } from "@/lib/api/reviews";

export function ApproveAction({ missionId }: { missionId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onApprove() {
    if (pending) return;
    setPending(true);
    // TODO Backend: replace with `POST /api/reviews/:missionId`. Server should
    // call the AWS Bedrock review agent, settle x402 payout, and return the
    // new Receipt id.
    const result = await reviewDeliverable(missionId);
    if (result) {
      router.push(`/receipt/${result.receipt.id}`);
    } else {
      setPending(false);
    }
  }

  return (
    <Button
      onClick={onApprove}
      variant="primary"
      size="md"
      disabled={pending}
      className="w-full"
    >
      {pending ? "Reviewing & paying..." : "Approve & Pay"}
    </Button>
  );
}
