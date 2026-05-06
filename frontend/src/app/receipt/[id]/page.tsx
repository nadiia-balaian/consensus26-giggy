import { notFound } from "next/navigation";
import { getReceiptById } from "@/lib/api/reviews";
import { ReceiptCard } from "@/components/receipts/ReceiptCard";
import { ShareButton } from "./ShareButton";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const receipt = await getReceiptById(id);
  if (!receipt) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-8">
      <header className="text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          Review &amp; Receipt
        </h1>
        <p className="mt-1 text-sm text-ink/70">
          Proof of execution and payout summary.
        </p>
      </header>

      <ReceiptCard receipt={receipt} />

      <ShareButton receiptId={receipt.id} />
    </div>
  );
}
