import type { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from "aws-lambda";

// GET /premium-news?topic=...
//
// First call (no X-PAYMENT header):
//   → 402 Payment Required, body describes how to pay
// Second call (valid X-PAYMENT header):
//   → 200 OK with the payload
//
// Phase 2 will replace the stubbed verification with the real x402 server lib.
// Until then, handler returns 402 unconditionally so the demo visibly fails
// without an x402 client.
export const premiumNews: APIGatewayProxyHandlerV2 = async (event) => {
  const paymentHeader = event.headers?.["x-payment"] ?? event.headers?.["X-PAYMENT"];
  const topic = event.queryStringParameters?.topic ?? "general";

  if (!paymentHeader) {
    return paymentRequired(topic);
  }

  // TODO Phase 2: verify the payment header against an on-chain settlement.
  // For now, accept any non-empty header so we can wire end-to-end before
  // x402 server libs are integrated.
  return ok({
    topic,
    articles: [
      {
        title: `Stubbed news for "${topic}" — Phase 2 will wire real data`,
        url: "https://example.com/article",
        publishedAt: new Date().toISOString(),
      },
    ],
  });
};

function paymentRequired(topic: string): APIGatewayProxyResultV2 {
  const recipient = process.env.RECIPIENT_WALLET ?? "0x0000000000000000000000000000000000000000";
  const price = process.env.PRICE_USDC ?? "0.01";
  const network = process.env.NETWORK ?? "base-sepolia";
  const usdc = process.env.USDC_ADDRESS ?? "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

  return {
    statusCode: 402,
    headers: {
      "Content-Type": "application/json",
      // Real x402 spec headers go here in Phase 2
      "X-Payment-Required": "true",
    },
    body: JSON.stringify({
      error: "payment_required",
      x402: {
        version: "1",
        scheme: "exact",
        network,
        recipient,
        token: usdc,
        price,
        resource: `/premium-news?topic=${encodeURIComponent(topic)}`,
      },
    }),
  };
}

function ok(body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
