import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";
import { http } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";
const rpcUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC ?? "https://sepolia.base.org";

if (!projectId) {
  console.warn("[wagmi] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set — WalletConnect-based wallets will fail to connect.");
}

export const wagmiConfig = getDefaultConfig({
  appName: "TaskVault",
  projectId: projectId || "placeholder",
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(rpcUrl),
  },
  ssr: true,
});
