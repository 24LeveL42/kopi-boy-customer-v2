import { Marketplace } from "@/components/Marketplace";
import { MERCHANTS } from "@/lib/demo-data";

/**
 * Customer marketplace home — Feature #001.
 *
 * Demo data only (see /src/lib/demo-data.ts). Once Feature #003
 * (merchant onboarding) and a real database exist, replace the direct
 * import below with a server-side data fetch and keep <Marketplace>
 * (the client component) unchanged — it only needs a Merchant[].
 */
export default function Home() {
  return <Marketplace merchants={MERCHANTS} />;
}
