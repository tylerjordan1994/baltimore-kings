import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/project/football-team",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.instagram.com https://www.youtube.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://images.unsplash.com https://i.ytimg.com https://scontent.cdninstagram.com https://*.stripe.com",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src https://js.stripe.com https://www.youtube.com https://www.instagram.com https://www.google.com https://maps.google.com",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in https://api.stripe.com https://api.resend.com",
              "object-src 'none'",
              "base-uri 'self'",
            ].join("; "),
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
