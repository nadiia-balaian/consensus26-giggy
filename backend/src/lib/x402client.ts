// x402 buyer-side client.
//
// Wraps `x402-axios` with a viem LocalAccount backed by the agent's
// CDP-managed wallet. When a paid API returns 402 the interceptor
// signs an EIP-3009 USDC transferWithAuthorization, the facilitator
// settles it on-chain, and the API serves the data.
//
// The agent uses ONE wallet (the same `0x7855…` that signs pickup +
// submitProof on the escrow). Every action is therefore from the same
// address on BaseScan — single-identity demo narrative.

import axios, { type AxiosResponse } from "axios";
import { withPaymentInterceptor, decodeXPaymentResponse } from "x402-axios";
import { toAccount } from "viem/accounts";
import { CdpClient } from "@coinbase/cdp-sdk";

let cachedClient: ReturnType<typeof axios.create> | null = null;
let cachedAddress: `0x${string}` | null = null;

async function buildClient() {
  const cdp = new CdpClient();
  const cdpAccount = await cdp.evm.getOrCreateAccount({ name: "taskvault-agent" });
  cachedAddress = cdpAccount.address as `0x${string}`;

  // Bridge CDP signing into a viem-compatible LocalAccount. CDP's account
  // exposes signMessage / signTypedData / signTransaction with a shape
  // compatible enough at runtime; we route viem's calls through it.
  const account = toAccount({
    address: cdpAccount.address as `0x${string}`,
    async signMessage({ message }) {
      const sig = await cdpAccount.signMessage({
        message: typeof message === "string" ? message : { raw: message.raw as `0x${string}` },
      } as Parameters<typeof cdpAccount.signMessage>[0]);
      return sig as `0x${string}`;
    },
    async signTypedData(parameters) {
      const sig = await cdpAccount.signTypedData(
        parameters as Parameters<typeof cdpAccount.signTypedData>[0],
      );
      return sig as `0x${string}`;
    },
    async signTransaction(transaction) {
      const sig = await cdpAccount.signTransaction(
        transaction as Parameters<typeof cdpAccount.signTransaction>[0],
      );
      return sig as `0x${string}`;
    },
  });

  // x402-axios accepts a LocalAccount directly — no walletClient needed.
  cachedClient = withPaymentInterceptor(axios.create(), account);
  return cachedClient;
}

async function client() {
  return cachedClient ?? (await buildClient());
}

/** Returns the agent's CDP-managed address (cached after first call). */
export async function getX402PayerAddress(): Promise<`0x${string}`> {
  if (cachedAddress) return cachedAddress;
  await buildClient();
  return cachedAddress!;
}

export interface X402Result<T> {
  data: T;
  /** On-chain settle tx hash for the USDC micropayment, if present. */
  txHash: string | null;
  /** Wallet that paid (the agent's). */
  payer: `0x${string}` | null;
}

/**
 * GET a URL through the x402 interceptor. If the server returns 402,
 * x402-axios automatically signs payment and retries. Returns the data
 * plus the settled tx hash extracted from `X-PAYMENT-RESPONSE`.
 */
export async function x402Get<T>(url: string): Promise<X402Result<T>> {
  const c = await client();
  const res: AxiosResponse<T> = await c.get(url);
  const settled = decodeXPaymentResponse(res.headers["x-payment-response"]);
  return {
    data: res.data,
    txHash: settled?.transaction ?? null,
    payer: (settled?.payer as `0x${string}` | undefined) ?? null,
  };
}
