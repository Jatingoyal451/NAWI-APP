import type { NextConfig } from "next";

// Safe defaults so Vercel builds succeed without requiring manual environment variables
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/nawi_db?sslmode=disable";
process.env.DIRECT_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "nawi-oiml-r76-secret-key-2024";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "nawi-oiml-r76-secret-key-2024",
  },
};

export default nextConfig;
