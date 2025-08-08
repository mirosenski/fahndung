/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const config = {
  // Temporär deaktiviert wegen doppelter Renders in React 19
  reactStrictMode: false,

  // 🚀 OPTIMIERTE NAVIGATION-KONFIGURATION
  experimental: {
    // Optimierte Package-Imports für schnellere Navigation
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-select",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@tanstack/react-query",
      "zustand",
    ],
  },

  // Optimierte Bilder-Konfiguration
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 Tage
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Verbesserte Pfad-Behandlung
    domains: [
      "rgbxdxrhwrszidbnsmuy.supabase.co",
      "via.placeholder.com",
      "staticmap.openstreetmap.de",
      "images.unsplash.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rgbxdxrhwrszidbnsmuy.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "staticmap.openstreetmap.de",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
    // Performance-Optimierungen für Bilder
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 🚀 OPTIMIERTE HEADERS FÜR SCHNELLERE NAVIGATION
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
          // 🚀 CACHE-OPTIMIERUNGEN FÜR NAVIGATION
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
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
      // 🚀 NAVIGATION-SPEZIFISCHE CACHE-HEADERS
      {
        source: "/dashboard",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=1800, stale-while-revalidate=3600",
          },
        ],
      },
      {
        source: "/fahndungen",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=900, stale-while-revalidate=1800",
          },
        ],
      },
    ];
  },

  // 🚀 OPTIMIERTE WEBPACK-KONFIGURATION FÜR SCHNELLERE NAVIGATION
  webpack: (config, { dev, isServer }) => {
    // Verbesserte Pfad-Behandlung
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // 🚀 NAVIGATION-OPTIMIERUNGEN NUR FÜR PRODUCTION
    if (!dev && !isServer) {
      // Code-Splitting optimieren für schnellere Navigation
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
          },
          // Separate Chunks für große Libraries
          radix: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: "radix-ui",
            chunks: "all",
            priority: 20,
          },
          lucide: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: "lucide",
            chunks: "all",
            priority: 20,
          },
          // 🚀 NAVIGATION-SPEZIFISCHE CHUNKS
          navigation: {
            test: /[\\/]components[\\/](layout|navigation|ui)[\\/]/,
            name: "navigation",
            chunks: "all",
            priority: 30,
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

  // React DevTools-Warnung unterdrücken
  compiler: {
    // Unterdrücke React DevTools-Warnung
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
};

export default withBundleAnalyzer(config);
