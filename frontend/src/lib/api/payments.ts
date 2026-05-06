import type { X402PaymentReceipt } from "@/types";
import { delay } from "@/lib/utils";
import { store } from "@/data/store";

/**
 * Payment API service.
 *
 * In production these endpoints proxy to the Coinbase x402 / Base settlement
 * service. For the demo we generate a plausible-looking tx hash.
 */

// TODO Backend: replace with `POST /api/payments/x402` { missionId }.
export async function payX402Claim(missionId: string): Promise<X402PaymentReceipt> {
  await delay(700);
  const mission = store.missions.find((m) => m.id === missionId);
  const txHash = `0x402${Math.random().toString(16).slice(2, 18)}`;
  return {
    txHash,
    baseScanUrl: `https://basescan.org/tx/${txHash}`,
    amountUsd: mission?.x402ClaimPriceUsd ?? 0,
  };
}

// TODO Backend: replace with `GET /api/payments/payout/:receiptId`.
export async function getPayoutStatus(
  receiptId: string,
): Promise<"pending" | "confirmed"> {
  await delay(150);
  const receipt = store.receipts.find((r) => r.id === receiptId);
  return receipt?.payoutStatus ?? "pending";
}
