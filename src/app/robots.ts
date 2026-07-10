import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://statusforge.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: ["/status", "/status/history"],
      disallow: ["/admin", "/admin/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
