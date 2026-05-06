import type { Receipt, ReviewResult } from "@/types";
import { nextReceiptId, store, upsertMission } from "@/data/store";
import { delay } from "@/lib/utils";

/**
 * Review API service.
 *
 * In production this calls the AWS Bedrock review agent which scores the
 * deliverable and (if approved) triggers payout via the payments service.
 */

// TODO Backend: replace with `POST /api/reviews/:missionId`.
// Should return a ReviewResult and create a Receipt server-side.
export async function reviewDeliverable(
  missionId: string,
): Promise<{ review: ReviewResult; receipt: Receipt } | null> {
  await delay(900);

  const mission = store.missions.find((m) => m.id === missionId);
  if (!mission) return null;

  const review: ReviewResult = {
    score: 98,
    rank: "Top 5%",
    reason:
      "Payload matches schema; 0% x402 error rate; unit tests passed.",
    approved: true,
  };

  mission.status = "paid";
  upsertMission(mission);

  const receipt: Receipt = {
    id: nextReceiptId(),
    missionId: mission.id,
    missionTitle: mission.title,
    deliverableName: mission.deliverableUrl ?? "deliverable_v1.zip",
    review,
    x402TxHash: mission.x402TxHash ?? "0x402a83f1...c4a58",
    gasUsed: "0.00042 ETH",
    payoutStatus: "confirmed",
    payoutWalletMasked: "0x***3aZ",
    totalPayoutUsd: mission.rewardUsd,
    issuedAt: new Date().toISOString(),
  };

  store.receipts = [receipt, ...store.receipts.filter((r) => r.id !== receipt.id)];

  return { review, receipt };
}

// TODO Backend: replace with `GET /api/receipts/:id`.
export async function getReceiptById(id: string): Promise<Receipt | null> {
  await delay(120);
  return store.receipts.find((r) => r.id === id) ?? null;
}

// TODO Backend: replace with `GET /api/receipts`.
export async function getReceipts(): Promise<Receipt[]> {
  await delay(120);
  return [...store.receipts];
}
