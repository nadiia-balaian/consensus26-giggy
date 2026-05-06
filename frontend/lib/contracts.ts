// Once `forge build` runs in contracts/, copy the ABI from
// contracts/out/TaskEscrow.sol/TaskEscrow.json into this file (or import it
// directly via a build step). Keeping it inline for now so the frontend
// compiles before the contract is deployed.

export const escrowAddress =
  (process.env.NEXT_PUBLIC_ESCROW_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const usdcAddress =
  (process.env.NEXT_PUBLIC_USDC_ADDRESS ?? "0x036CbD53842c5426634e7929541eC2318f3dCF7e") as `0x${string}`;

export const escrowAbi = [
  // Phase 1 will replace this with the full ABI from `forge build`.
  // Keeping a minimal subset so types resolve in the meantime.
  {
    type: "function",
    name: "createTask",
    stateMutability: "nonpayable",
    inputs: [
      { name: "bounty", type: "uint256" },
      { name: "specHash", type: "bytes32" },
    ],
    outputs: [{ name: "taskId", type: "uint256" }],
  },
  {
    type: "function",
    name: "release",
    stateMutability: "nonpayable",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "refund",
    stateMutability: "nonpayable",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [],
  },
] as const;

export const usdcAbi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
