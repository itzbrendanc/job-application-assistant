import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(__dirname, "..", "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Prevent Next from inferring the wrong workspace root when multiple lockfiles exist.
  outputFileTracingRoot: monorepoRoot,
  eslint: {
    // Build should not depend on lint state; run `npm run lint -w apps/web` in CI.
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
