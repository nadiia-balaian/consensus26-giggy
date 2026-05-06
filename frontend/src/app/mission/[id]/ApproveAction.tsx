"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useAccount,
  useSwitchChain,
  useWriteContract,
  usePublicClient,
} from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { Button } from "@/components/ui/Button";
import { ESCROW_ADDRESS, escrowAbi } from "@/lib/contracts";
import { recordRelease } from "@/lib/api/missions";

type Step = "idle" | "switching" | "releasing" | "syncing" | "done" | "error";

const STEP_LABELS: Record<Step, string> = {
  idle: "Approve & Pay",
  switching: "Switching network…",
  releasing: "Confirming release on-chain…",
  syncing: "Syncing…",
  done: "Released ✓",
  error: "Try again",
};

export function ApproveAction({ missionId }: { missionId: string }) {
  const router = useRouter();
  const { isConnected, chainId: walletChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: baseSepolia.id });
  const { writeContractAsync } = useWriteContract();

  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const [releaseTx, setReleaseTx] = useState<string | null>(null);

  // The on-chain taskId is the numeric mission id from the TaskCreated event.
  // Legacy mock missions have ids like "m_1234..." — release won't work for those.
  const numericTaskId = /^\d+$/.test(missionId) ? missionId : null;
  const onWrongChain = isConnected && walletChainId !== baseSepolia.id;

  async function onApprove() {
    if (step !== "idle" && step !== "error") return;
    if (!isConnected) {
      setError("Connect your wallet first");
      return;
    }
    if (!numericTaskId) {
      setError("This mission has no on-chain task id (legacy mock).");
      return;
    }
    if (!publicClient) {
      setError("Network not ready");
      return;
    }
    if (
      !confirm(
        "Release the bounty to the agent? This is an on-chain transaction and cannot be undone.",
      )
    ) {
      return;
    }

    setError(null);
    try {
      if (walletChainId !== baseSepolia.id) {
        setStep("switching");
        await switchChainAsync({ chainId: baseSepolia.id });
      }

      setStep("releasing");
      const txHash = await writeContractAsync({
        chainId: baseSepolia.id,
        address: ESCROW_ADDRESS,
        abi: escrowAbi,
        functionName: "release",
        args: [BigInt(numericTaskId)],
      });
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      setReleaseTx(txHash);

      setStep("syncing");
      await recordRelease(missionId, txHash);

      setStep("done");
      router.refresh();
    } catch (err) {
      setStep("error");
      const msg = err instanceof Error ? err.message : "Release failed";
      setError(msg.length > 140 ? msg.slice(0, 140) + "…" : msg);
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      {!numericTaskId && (
        <p className="rounded-xl bg-yellow-100 px-3 py-2 text-xs text-yellow-900">
          Legacy mission — no on-chain task id, release disabled.
        </p>
      )}
      {onWrongChain && step === "idle" && (
        <p className="rounded-xl bg-yellow-100 px-3 py-2 text-xs text-yellow-900">
          Wrong network. We&apos;ll switch you to Base Sepolia.
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-red-100 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      {releaseTx && step === "done" && (
        <a
          href={`https://sepolia.basescan.org/tx/${releaseTx}`}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all rounded-xl bg-green-100 px-3 py-2 text-xs text-green-900 underline"
        >
          Released ✓ — view on BaseScan
        </a>
      )}
      <Button
        onClick={onApprove}
        variant="primary"
        size="md"
        disabled={
          !numericTaskId ||
          (step !== "idle" && step !== "error")
        }
        className="w-full"
      >
        {!isConnected ? "Connect wallet first" : STEP_LABELS[step]}
      </Button>
    </div>
  );
}
