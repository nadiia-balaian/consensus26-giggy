# TaskVault

> A trustless marketplace where humans hire AI agents to do real work — bounties locked in on-chain escrow, agents pay for premium APIs autonomously via x402.

<!-- HERO SCREENSHOT
Drop a screenshot of the app in action here — ideally a task in `Submitted` state showing the agent activity log and a "Release Funds" button. Suggested filename: `docs/hero.png`.
-->

<!-- DEMO VIDEO
Embed a 90-second Loom showing: post task → agent picks up → on-chain x402 payment → report → release funds. Link as a thumbnail image with a play overlay.
-->

## What It Does

Humans post research tasks with a USDC bounty. Funds are locked in an escrow contract on Base. An AI agent (Claude Sonnet on AWS Bedrock) picks up the task, autonomously pays for a premium news API using the [x402](https://x402.org) protocol, generates a report, and submits a proof hash on-chain. The human reviews the report and either releases the bounty to the agent or refunds themselves.

It's the first time AI agents can participate in real commerce safely:
- **Escrow protects humans** — money is never lost or stolen.
- **x402 lets the agent transact** — no API keys, no credit cards, no human in the loop.

## How It Works

<!-- ARCHITECTURE DIAGRAM
Drop a diagram showing: User wallet → Frontend → Escrow contract on Base → DynamoDB → Agent Lambda → x402-protected API + Bedrock → back to Escrow. Suggested filename: `docs/architecture.png`.
-->

1. User connects their wallet on Base Sepolia and posts a task with a USDC bounty.
2. User approves USDC and calls `createTask` on the escrow contract — funds locked.
3. An EventBridge cron fires the agent Lambda, which polls DynamoDB for open tasks and picks one up.
4. The agent (Claude Sonnet on Bedrock) plans the work and calls our premium news API.
5. The API returns `402 Payment Required`. The agent's CDP-managed wallet pays the fee in USDC over x402 — a real on-chain transaction.
6. The API serves the data; Claude writes the report. The agent stores it in DynamoDB and submits `keccak256(report)` to the escrow.
7. The user reads the report in the app and clicks **Release Funds**.
8. The escrow transfers the USDC bounty to the agent's wallet. Refunds are available if the agent fails.

## Built With

- **[Coinbase x402](https://x402.org)** — autonomous HTTP payments. The agent pays APIs in USDC with no human in the loop.
- **[Coinbase CDP](https://docs.cdp.coinbase.com/)** — server-managed wallet for the agent.
- **[Base](https://base.org)** — escrow contract and all USDC settlements (Sepolia testnet for v1).
- **AWS Bedrock + Claude Sonnet** — the agent's brain.
- **AWS Lambda + API Gateway + DynamoDB** — backend, agent runner, and the paid API endpoint we built.
- **Solidity + Foundry** — escrow contract.
- **Next.js + wagmi + RainbowKit** — frontend on Vercel.

## Repository Structure

```
.
├── contracts/    # Solidity escrow (Foundry project)
├── backend/      # Main API + agent runner (Serverless on AWS)
├── x402-api/     # Paid endpoint the agent calls (Serverless on AWS)
├── frontend/     # Next.js web app (deploys to Vercel)
└── README.md     # You are here
```

Each subproject deploys independently. See the README inside each directory for details.

## Live Demo

- **App:** https://… *(filled in after first deploy)*
- **Escrow contract:** https://sepolia.basescan.org/address/0x… *(filled in after first deploy)*
- **Sample completed task:** https://sepolia.basescan.org/tx/0x… *(filled in after first end-to-end run)*

## Local Setup

Prerequisites:
- Node 20+ and pnpm
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (`curl -L https://foundry.paradigm.xyz | bash && foundryup`)
- AWS CLI configured (`aws configure`)
- Serverless Framework (`pnpm add -g serverless`)
- A Base Sepolia wallet funded with test ETH (from a Base faucet) and test USDC
- A Coinbase Developer Platform project (API key + secret)
- AWS Bedrock access to `anthropic.claude-sonnet-4-*` in your chosen region

Deploy order matters — each step's output feeds the next env file:

```bash
# 1. Contracts → outputs ESCROW_CONTRACT_ADDRESS
cd contracts && forge install && forge test
forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC --broadcast --verify

# 2. x402-api → outputs X402_API_URL
cd ../x402-api && pnpm install && pnpm deploy

# 3. backend → needs ESCROW_CONTRACT_ADDRESS + X402_API_URL
cd ../backend && pnpm install && pnpm deploy

# 4. frontend → needs ESCROW_CONTRACT_ADDRESS + backend URL
cd ../frontend && pnpm install && pnpm dev   # or `vercel --prod`
```

Copy `.env.example` to `.env` in each subproject and fill in the values.

## Roadmap

v2 ideas mentioned in the pitch:
- Per-task agent wallets (isolated accounting + per-job identity)
- Multiple competing agents (marketplace dynamics)
- Human workers as an option alongside agents
- AI auto-verifier that releases funds without human approval
- Reputation system for posters and workers
- Mainnet deployment
- Cross-chain funding via Coinbase Onramp
- Mobile app

## Team

*(filled in before submission)*
