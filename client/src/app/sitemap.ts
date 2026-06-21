import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://belenay.com";
const LOCALES = ["tr", "ru", "ky"];

// Helper: locale prefix
const localePath = (locale: string, path: string) => {
  return locale === "tr" ? path : `/${locale}${path}`;
};

// Helper: alternate languages object
const buildAlternates = (path: string) => {
  const alternates: Record<string, string> = {};
  for (const locale of LOCALES) {
    alternates[locale === "tr" ? "tr-TR" : locale === "ru" ? "ru-RU" : "ky-KG"] =
      `${SITE_URL}${localePath(locale, path)}`;
  }
  return alternates;
};

async function fetchFromAPI<T>(path: string): Promise<T[]> {
  try {
    const API_URL = process.env.API_URL || "http://localhost:3001";
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 3600 }, // 1 hour cache
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.items || data.data || [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ─── Static pages ───────────────────────────────────────────────
  const staticPaths = [
    { path: "/", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/kategorii", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/o-nas", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/kontakty", priority: 0.6, changeFrequency: "monthly" as const },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
    alternates: { languages: buildAlternates(path) },
  }));

  // ─── Dynamic: Categories ──────────────────────────────────────
  const categories = await fetchFromAPI<{ slug: string; updatedAt?: string }>("/categories");
  const categoryEntries: MetadataRoute.Sitemap = categories.flatMap((cat) => {
    const path = `/kategoriya/${cat.slug}`;
    return [{
      url: `${SITE_URL}${path}`,
      lastModified: cat.updatedAt ? new Date(cat.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
      alternates: { languages: buildAlternates(path) },
    }];
  });

  // ─── Dynamic: Products ───────────────────────────────────────
  const products = await fetchFromAPI<{ slug: string; updatedAt?: string }>("/products");
  const productEntries: MetadataRoute.Sitemap = products.flatMap((product) => {
    const path = `/tovar/${product.slug}`;
    return [{
      url: `${SITE_URL}${path}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: { languages: buildAlternates(path) },
    }];
  });

  // ─── Dynamic: Blog Posts ─────────────────────────────────────
  const posts = await fetchFromAPI<{ slug: string; updatedAt?: string; isPublished?: boolean }>("/blog");
  const blogEntries: MetadataRoute.Sitemap = posts
    .filter((p) => p.isPublished !== false)
    .flatMap((post) => {
      const path = `/blog/${post.slug}`;
      return [{
        url: `${SITE_URL}${path}`,
        lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
        changeFrequency: "monthly" as const,
        priority: 0.65,
        alternates: { languages: buildAlternates(path) },
      }];
    });

  // ─── Dynamic: Special Pages ───────────────────────────────────
  const specialPages = await fetchFromAPI<{ slug: string; updatedAt?: string; isActive?: boolean }>("/special-pages");
  const specialEntries: MetadataRoute.Sitemap = specialPages
    .filter((p) => p.isActive !== false)
    .flatMap((page) => {
      const path = `/special/${page.slug}`;
      return [{
        url: `${SITE_URL}${path}`,
        lastModified: page.updatedAt ? new Date(page.updatedAt) : now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
        alternates: { languages: buildAlternates(path) },
      }];
    });

  return [
    ...staticEntries,
    ...categoryEntries,
    ...productEntries,
    ...blogEntries,
    ...specialEntries,
  ];
}
