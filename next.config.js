/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import('next').NextConfig} */
const config = {
  experimental: {
    // optimizePackageImports: ["lucide-react"], // Temporär deaktiviert wegen HMR Problem
  },

  // Neue Turbopack-Konfiguration (statt experimental.turbo)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  // Neue serverExternalPackages-Konfiguration (statt experimental.serverComponentsExternalPackages)
  serverExternalPackages: [],

  // Performance-Optimierungen
  compress: true,
  poweredByHeader: false,

  // Verbesserte Dateisystem-Behandlung
  onDemandEntries: {
    // Längere TTL für bessere Performance
    maxInactiveAge: 25 * 1000,
    // Mehr Seiten im Speicher halten
    pagesBufferLength: 2,
  },

  // Optimierte Bilder-Konfiguration
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 Tage
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Verbesserte Pfad-Behandlung
    domains: [],
    remotePatterns: [],
  },

  // Optimierte Headers für Caching
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, stale-while-revalidate=600",
          },
        ],
      },
      {
        source:
          "/(.*\\.js|.*\\.css|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.ico|.*\\.svg|.*\\.woff|.*\\.woff2|.*\\.ttf|.*\\.eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Optimierte Webpack-Konfiguration (nur für Production Build)
  webpack: (config, { dev, isServer }) => {
    // Verbesserte Pfad-Behandlung
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Optimierungen nur für Production
    if (!dev && !isServer) {
      // Code-Splitting optimieren
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      };
    }

    return config;
  },

  // Optimierte TypeScript-Konfiguration
  typescript: {
    ignoreBuildErrors: false,
  },

  // Optimierte ESLint-Konfiguration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Verbesserte Trailing Slash-Behandlung
  trailingSlash: false,

  // Optimierte Base Path-Konfiguration
  basePath: "",

  // Verbesserte Asset-Prefix-Konfiguration
  assetPrefix: "",
};

export default config;
