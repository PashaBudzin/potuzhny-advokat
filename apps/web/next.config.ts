import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "50mb",
        },
    },
    transpilePackages: [
        "@potuzhny-advokat/db",
        "@potuzhny-advokat/strings",
        "@potuzhny-advokat/accounting",
        "@potuzhny-advokat/auth-crypto",
    ],
};

export default nextConfig;
