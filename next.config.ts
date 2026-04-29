import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ae01.alicdn.com" },
      { protocol: "https", hostname: "ae02.alicdn.com" },
      { protocol: "https", hostname: "ae03.alicdn.com" },
      { protocol: "https", hostname: "ae04.alicdn.com" },
      { protocol: "https", hostname: "ae05.alicdn.com" },
      { protocol: "https", hostname: "ae06.alicdn.com" },
      { protocol: "https", hostname: "ae07.alicdn.com" },
      { protocol: "https", hostname: "ae08.alicdn.com" },
      { protocol: "https", hostname: "ae09.alicdn.com" },
      { protocol: "https", hostname: "ae10.alicdn.com" },
      { protocol: "https", hostname: "img.alicdn.com" },
      { protocol: "https", hostname: "www.aliexpress.com" },
      { protocol: "https", hostname: "www.aliexpress-media.com" },
    ],
  },
};

export default nextConfig;
