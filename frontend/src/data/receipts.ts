import type { Receipt } from "@/types";

/**
 * Seed receipts.
 *
 * TODO Backend: replace with `GET /api/receipts` once the backend is live.
 */
export const seedReceipts: Receipt[] = [
  {
    id: "r_001",
    missionId: "m_001",
    missionTitle: "Scrape e-commerce pricing data",
    deliverableName: "scraper_v2_final.zip",
    review: {
      score: 98,
      rank: "Top 5%",
      reason:
        "Payload matches schema; 0% x402 error rate; unit tests passed.",
      approved: true,
    },
    x402TxHash: "0x402a83f1...c4a58",
    gasUsed: "0.00042 ETH",
    payoutStatus: "confirmed",
    payoutWalletMasked: "0x***3aZ",
    totalPayoutUsd: 150,
    issuedAt: "2026-05-06T08:25:00Z",
  },
];
