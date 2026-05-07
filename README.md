# Giggy

> A trustless marketplace where humans hire AI agents to do real work. Bounties are locked in on-chain escrow on Base. Agents autonomously pay for premium APIs via x402 — no API keys, no credit cards, no humans in the middle.

<!-- HERO SCREENSHOT
Drop `docs/hero.png` here — ideally a mission detail page in `Submitted` state showing the live activity feed with the x402_payment row visible.
-->

<!-- DEMO VIDEO
<div style="position: relative; padding-bottom: 64.63195691202873%; height: 0;"><iframe src="https://www.loom.com/embed/43dd8a823f5041adb1ff88192c21a392" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>
-->

## Live Demo

- **App:** *https://consensus26-giggy.vercel.app/*
- **Escrow contract:** [`0xc8e37583151D0c9818dC22E08C8acaDa5B68685b`](https://sepolia.basescan.org/address/0xc8e37583151D0c9818dC22E08C8acaDa5B68685b) on Base Sepolia
- **Agent wallet (CDP-managed)** — signs `pickup` and `submitProof`: [`0x78559750eCD96320BCdDaA02B2cff88D87CB4BeB`](https://sepolia.basescan.org/address/0x78559750eCD96320BCdDaA02B2cff88D87CB4BeB)
- **Agent x402 wallet** — pays USDC for premium APIs: [`0x3fc809FaE433713Ff0bf9eF213868b39753f58b9`](https://sepolia.basescan.org/address/0x3fc809FaE433713Ff0bf9eF213868b39753f58b9)
- **Backend API:** `https://k6yy37gbcf.execute-api.us-east-2.amazonaws.com`
- **x402-paywalled API:** `https://3sieiu9hkl.execute-api.us-east-2.amazonaws.com/premium-news`
- **Giggy Overview Loom Demo:** https://www.loom.com/share/43dd8a823f5041adb1ff88192c21a392

## What It Does

A user posts a research mission with a USDC bounty. The funds are locked in an escrow smart contract on Base. An AI agent running on AWS Lambda automatically picks up the mission, **pays for premium research data via x402** (real on-chain USDC micropayment), generates a report with Claude Sonnet on Bedrock, and commits a hash of the report on-chain. The user reads the report and either releases the bounty to the agent or refunds themselves.

It's the first end-to-end demonstration of trustless AI agent commerce:

- **Escrow protects humans.** Funds can't be lost or stolen — the smart contract enforces who can claim what.
- **x402 lets the agent transact.** No API keys, no credit cards, no human in the loop. The agent buys what it needs in cents and fractions, settled instantly on-chain.

## How It Works

<!-- ARCHITECTURE DIAGRAM
Drop `docs/architecture.png` here. Frontend → Escrow → Backend → Agent Lambda ↔ x402-api ↔ Bedrock.
-->

```
User wallet (MetaMask)
    │
    │ 1. approve USDC + createTask  ──────────►  Escrow on Base Sepolia
    │
    │ 2. POST /api/missions  ──────────►  Backend (Lambda) ──► DynamoDB
    │
                                                    │
        EventBridge cron (every 60s) ──► Agent Lambda
                                                    │
                                                    │ 3. pickup(taskId)  ──► Escrow
                                                    │ 4. plan via Bedrock (Claude Sonnet)
                                                    │ 5. GET /premium-news → 402 Payment Required
                                                    │ 6. sign EIP-3009 USDC transfer
                                                    │     ─► Coinbase x402 facilitator settles on-chain
                                                    │     ─► x402-api Lambda calls Bedrock for fresh research
                                                    │ 7. write report via Bedrock
                                                    │ 8. submitProof(taskId, keccak256(report))  ──► Escrow
                                                    │
User reads report on the live mission page  ◄──────┘
    │
    │ 9. release(taskId)  ──────────►  Escrow transfers USDC to agent
    │
```

The mission detail page polls the activity feed live every 2.5 seconds, so users watch the agent work step-by-step — including the moment the x402 micropayment lands on Base Sepolia.

## Built With

### Coinbase
- **[x402](https://x402.org)** — HTTP-native autonomous payments. The agent pays for APIs in USDC over the x402 protocol with zero human intervention. We built and deployed both sides — a paywalled API and an autonomous client — to demonstrate the full protocol.
- **[Coinbase Developer Platform (CDP)](https://docs.cdp.coinbase.com/)** — server-managed wallet for the agent's escrow operations (`pickup`, `submitProof`). Keys never leave Coinbase's secure infra.
- **[Base](https://base.org)** — Base Sepolia for the escrow contract and all USDC settlements.

### AWS
- **Amazon Bedrock (Claude Sonnet 4)** — the agent's brain. Two Bedrock invocations per mission: one to plan the research, one to write the deliverable. Plus a **third** Bedrock call inside our paid x402-api endpoint, generating the topic-specific research data the agent buys.
- **AWS Lambda** — the entire backend. 9 functions covering mission CRUD, deliverable serving, the agent runner, and the agent cron.
- **AWS API Gateway (HTTP API v2)** — public REST surface for the frontend.
- **AWS DynamoDB** — 4 tables: missions (with GSI on status), live activity log, generated reports, agent runtime state.
- **AWS EventBridge** — `rate(1 minute)` schedule that triggers the agent Lambda autonomously.
- **AWS Lambda async invoke** — the demo "Run Agent" trigger uses fire-and-forget invocation so the UI gets a 202 response instantly while the agent runs for ~60s in the background.
- **AWS IAM** — least-privilege scoped roles per function.
- **AWS CloudFormation** — the entire stack is deployed as one template via the Serverless Framework.

### Other
- **Solidity + Foundry** — escrow contract with a state machine (`Open → Assigned → Submitted → Released | Refunded`) and 7 unit tests.
- **Next.js 16 + wagmi v3 + viem** — frontend on Vercel with full MetaMask integration, chain-guarded transactions, and live activity polling.
- **Tailwind v4** — handcrafted "doodle" design system with a custom Dialog matching the existing UI for confirms/alerts.

## Repository Structure

```
.
├── contracts/    Solidity escrow                (Foundry)
├── backend/      Main API + agent runner        (Serverless on AWS Lambda)
├── x402-api/     Paid endpoint the agent calls  (Serverless on AWS Lambda)
├── frontend/     Web app                        (Next.js → Vercel)
├── scripts/      One-off helpers                (CDP faucet, USDC transfers)
├── PLAN.md       Build plan + demo script
└── README.md
```

Each subproject deploys independently. The `PLAN.md` file documents every phase and the demo script.

## Local Setup

Prerequisites:
- Node 20+ and pnpm
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (`curl -L https://foundry.paradigm.xyz | bash && foundryup`)
- AWS CLI configured (`aws configure`)
- Serverless Framework (`pnpm add -g serverless`)
- A Base Sepolia wallet funded with test ETH and test USDC
- A Coinbase Developer Platform project (API key + secret + wallet secret)
- AWS Bedrock access to `anthropic.claude-sonnet-4-*` in your chosen region

Deploy order — each step's output feeds the next env file:

```bash
# 1. Contracts → outputs ESCROW_CONTRACT_ADDRESS
cd contracts && forge install && forge test
forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC --broadcast --verify

# 2. x402-api → outputs X402_API_URL
cd ../x402-api && pnpm install && pnpm run deploy

# 3. Backend → needs ESCROW_CONTRACT_ADDRESS + X402_API_URL + CDP keys
cd ../backend && pnpm install && pnpm run deploy

# 4. Frontend → needs ESCROW_CONTRACT_ADDRESS + backend URL
cd ../frontend && pnpm install && pnpm dev   # or `vercel --prod`
```

Copy `.env.example` to `.env` in each subproject and fill in the values.

### Funding the agent wallets

The agent has two on-chain identities — a CDP-managed wallet for escrow operations and a hot key for x402 payments. Both need Base Sepolia gas/USDC. Helper scripts under `scripts/`:

```bash
# Faucet a wallet via CDP (testnet ETH + USDC)
node scripts/fund-wallet.mjs <0xAddress>

# Move USDC between wallets (e.g. CDP agent → x402 hot wallet)
node scripts/transfer-usdc.mjs <0xTo> <amountUsd>
```

## Roadmap

Items mentioned in the pitch but out of scope for v1:
- Per-task agent wallets (isolated accounting + per-job identity)
- Multiple competing agents on the same mission (marketplace dynamics)
- Human workers as an option alongside AI agents
- AI auto-verifier that releases funds without human approval
- Reputation system for posters and workers
- Mainnet deployment
- Cross-chain funding via Coinbase Onramp
- Mobile app

## Team

*Kenny Johns*

---

Built for the **Coinbase + AWS** track. The first demo of an AI agent that earns and spends money, on-chain, with no humans in the middle.
