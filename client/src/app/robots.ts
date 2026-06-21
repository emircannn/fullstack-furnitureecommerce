import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://belenay.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/*/admin",
          "/*/admin/*",
          "/*/kabinet",
          "/*/kabinet/*",
          "/*/nastroiki",
          "/*/moi-zakazy",
          "/*/izbrannoe",
          "/*/vhod",
          "/*/registraciya",
          "/*/korzina",
          "/*/korzina/*",
        ],
      },
      {
        // Block AI training bots
        userAgent: ["GPTBot", "ChatGPT-User", "Google-Extended", "CCBot", "anthropic-ai"],
        disallow: ["/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
