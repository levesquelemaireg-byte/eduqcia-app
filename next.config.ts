import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // TAÉ / documents : publication envoie un état riche (HTML grilles, pièces jointes
  // métadonnées) — la limite Next par défaut (1 MB) provoque une 500 côté action.
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
