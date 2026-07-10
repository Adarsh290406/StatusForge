import type { NextConfig } from "next";
import { withReticle } from "@reticlehq/core/next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@node-rs/argon2"],
};

export default withReticle(nextConfig as any);
