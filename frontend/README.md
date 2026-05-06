# frontend/

Next.js 15 + wagmi v2 + RainbowKit on Base Sepolia. Deploys to Vercel.

## Setup

```bash
pnpm install
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (free from cloud.walletconnect.com)
# the rest get filled in as the other subprojects deploy

pnpm dev   # → http://localhost:3000
```

## Deploy

```bash
pnpm dlx vercel --prod
# set the same NEXT_PUBLIC_* env vars in the Vercel project settings
```

## Phase plan

- **Phase 0 (now):** wallet connect only
- **Phase 5:** post-task form (USDC approve → `createTask`), task list page, task detail page with live activity feed (polls `/tasks/:id/activity`), release/refund buttons, BaseScan links throughout

## Notes

- The escrow ABI in `lib/contracts.ts` is currently a minimal stub. Once `contracts/` is deployed, replace it with the full ABI from `contracts/out/TaskEscrow.sol/TaskEscrow.json`.
- Server-rendered wallet state is intentional (`ssr: true` in `lib/wagmi.ts`) so the page renders without flashing the disconnected state.
