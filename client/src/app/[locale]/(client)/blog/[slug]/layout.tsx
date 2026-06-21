import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://belenay.com";
const API_URL = process.env.API_URL || "http://localhost:3001";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const res = await fetch(`${API_URL}/blog/${slug}`, {
      next: { revalidate: 7200 },
    });
    if (!res.ok) throw new Error("not found");

    const post = await res.json();

    const title =
      post.translations?.find((t: { locale: string; title?: string }) => t.locale === locale)?.title ||
      post.translations?.[0]?.title ||
      slug;

    const excerpt =
      post.translations?.find((t: { locale: string; excerpt?: string }) => t.locale === locale)?.excerpt ||
      post.translations?.[0]?.excerpt ||
      `${title} - Belenay Mobilya Blog`;

    const imageUrl = post.coverImage
      ? `${API_URL}${post.coverImage}`
      : `${SITE_URL}/assets/og-image.jpg`;

    const canonicalPath =
      locale === "tr" ? `/blog/${slug}` : `/${locale}/blog/${slug}`;

    return {
      title: `${title} | Belenay Blog`,
      description: excerpt?.slice(0, 160),
      openGraph: {
        title: `${title} | Belenay Blog`,
        description: excerpt?.slice(0, 160),
        url: `${SITE_URL}${canonicalPath}`,
        images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
        type: "article",
        publishedTime: post.createdAt,
        modifiedTime: post.updatedAt,
        authors: ["Belenay Mobilya"],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | Belenay Blog`,
        description: excerpt?.slice(0, 160),
        images: [imageUrl],
      },
      alternates: {
        canonical: `${SITE_URL}${canonicalPath}`,
        languages: {
          "tr-TR": `${SITE_URL}/blog/${slug}`,
          "ru-RU": `${SITE_URL}/ru/blog/${slug}`,
          "ky-KG": `${SITE_URL}/ky/blog/${slug}`,
        },
      },
    };
  } catch {
    return {
      title: "Blog | Belenay Mobilya",
      description: "Belenay Mobilya blog yazısı",
    };
  }
}

export default function BlogPostLayout({
  children,
  params: _params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
}) {
  return <>{children}</>;
}
