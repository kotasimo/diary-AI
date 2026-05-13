import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config, { dev }) {
    if (dev) {
      // Windows環境で webpack PackFileCacheStrategy の rename が
      // Defenderや重複dev serverと衝突して壊れるのを避ける。
      // 本番ビルドのキャッシュは維持し、開発時だけ無効化する。
      config.cache = false;
    }

    return config;
  },
};

export default nextConfig;
