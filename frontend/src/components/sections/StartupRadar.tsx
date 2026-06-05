import { fetchStartups } from "@/lib/api";
import { StartupRadarClient } from "./StartupRadarClient";

export async function StartupRadar() {
  const startups = await fetchStartups();
  return <StartupRadarClient startups={startups} />;
}
