import AppShell from "@/components/AppShell";
import { loadAllMarkers } from "@/lib/loadMarkers";

// Markers are static data — render once at build time.
export const dynamic = "force-static";

export default async function Page() {
  const features = await loadAllMarkers();
  return <AppShell features={features} />;
}
