import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // DEMO DATA ONLY: picsum.photos backs the placeholder merchant photos
    // used until Feature #003/#004 (merchant onboarding + profile) wires up
    // real uploaded images via Supabase Storage. Remove this remote pattern
    // once real merchant images replace demo-data.ts.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
