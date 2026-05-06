export type MissionStatus =
  | "open"
  | "claimed"
  | "submitted"
  | "reviewing"
  | "approved"
  | "paid";

export type WorkerType = "aws_agent" | "human" | "any";

export type Mission = {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  rewardUsd: number;
  x402ClaimPriceUsd: number;
  workerType: WorkerType;
  status: MissionStatus;
  /** ISO date string (yyyy-mm-dd or full ISO). */
  deadline: string;
  /** ISO timestamp. */
  createdAt: string;
  /** Worker / agent identifier once claimed. */
  claimedBy?: string;
  /** Timestamp when claimed. */
  claimedAt?: string;
  /** Timestamp when work was submitted. */
  submittedAt?: string;
  /** Filename / URL of submitted deliverable. */
  deliverableUrl?: string;
  /** Optional admin note shown on detail page. */
  adminNote?: string;
  /** Marks a card as featured on the market. */
  featured?: boolean;
  /** Mock x402 / Base payment proof attached on claim. */
  x402TxHash?: string;
};

export type AgentTrigger =
  | "High Reward Tier"
  | "Negative Spread"
  | "Low Complexity Opt"
  | "Zero Cost Opportunity"
  | "High Risk/Cost ratio";

export type AgentClaimStatus =
  | "CLAIMED"
  | "IGNORED"
  | "PROCESSING"
  | "COMPLETED";

export type AgentDecision = {
  id: string;
  missionId: string;
  missionTitle: string;
  reward: number;
  x402Cost: number;
  /** Reward minus x402 cost minus mock complexity factor. */
  expectedValue: number;
  trigger: AgentTrigger;
  claimStatus: AgentClaimStatus;
};

export type AgentSnapshot = {
  online: boolean;
  /** Seconds since last cron scan. */
  lastScanSecondsAgo: number;
  missionsScanned: number;
  missionsClaimed: number;
  expectedValueUsd: number;
  decisions: AgentDecision[];
};

export type ReviewResult = {
  /** 0..100 quality score from AWS review agent. */
  score: number;
  /** Human-readable rank like "Top 5%". */
  rank: string;
  reason: string;
  approved: boolean;
};

export type Receipt = {
  id: string;
  missionId: string;
  missionTitle: string;
  /** Filename of the agent's deliverable (e.g. "scraper_v2_final.zip"). */
  deliverableName: string;
  review: ReviewResult;
  /** Mock Base / x402 transaction hash. */
  x402TxHash: string;
  /** Mock gas used in ETH (string for display). */
  gasUsed: string;
  payoutStatus: "pending" | "confirmed";
  /** Masked wallet, e.g. "0x***3aZ". */
  payoutWalletMasked: string;
  totalPayoutUsd: number;
  /** ISO timestamp. */
  issuedAt: string;
};

export type CreateMissionInput = {
  title: string;
  description: string;
  rewardUsd: number;
  x402ClaimPriceUsd: number;
  workerType: WorkerType;
  /** yyyy-mm-dd. */
  deadline: string;
  successCriteria: string;
};

export type SubmitDeliverablePayload = {
  deliverableUrl: string;
  notes?: string;
};

export type X402PaymentReceipt = {
  txHash: string;
  baseScanUrl: string;
  amountUsd: number;
};
