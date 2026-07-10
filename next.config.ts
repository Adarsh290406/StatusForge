import type { NextConfig } from "next";
import { withReticle } from "@reticlehq/core/next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@node-rs/argon2"],
  turbopack: {},
};

export default withReticle(nextConfig as any);
