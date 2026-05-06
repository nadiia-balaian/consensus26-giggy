import { getAgentSnapshot } from "@/lib/api/agent";
import { AgentDashboardClient } from "./AgentDashboardClient";

export default async function AgentDashboardPage() {
  const snapshot = await getAgentSnapshot();
  return <AgentDashboardClient initialSnapshot={snapshot} />;
}
