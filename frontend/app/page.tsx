"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "4rem auto", padding: "0 1rem", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <h1 style={{ margin: 0 }}>TaskVault</h1>
        <ConnectButton />
      </header>

      <section>
        <p style={{ fontSize: "1.1rem", lineHeight: 1.6, color: "#555" }}>
          Post a task, lock USDC in escrow, and watch an AI agent do the work — paying for premium APIs autonomously over x402.
        </p>
        <p style={{ marginTop: "2rem", padding: "1rem", background: "#f5f5f5", borderRadius: 8 }}>
          <strong>Phase 0:</strong> wallet connect only. Phase 5 wires the post-task form, task list, live activity feed, and release/refund actions.
        </p>
      </section>
    </main>
  );
}
