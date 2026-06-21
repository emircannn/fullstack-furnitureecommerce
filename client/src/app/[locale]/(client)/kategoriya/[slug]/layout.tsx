import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://belenay.com";
const API_URL = process.env.API_URL || "http://localhost:3001";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const res = await fetch(`${API_URL}/categories/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("not found");

    const category = await res.json();

    const name =
      category.translations?.find((t: { locale: string; name?: string }) => t.locale === locale)?.name ||
      category.translations?.[0]?.name ||
      slug;

    const description =
      category.translations?.find((t: { locale: string; description?: string }) => t.locale === locale)?.description ||
      `${name} kategorisindeki mobilyaları keşfedin - Belenay Mobilya`;

    const imageUrl = category.imageUrl
      ? `${API_URL}${category.imageUrl}`
      : `${SITE_URL}/assets/og-image.jpg`;

    const canonicalPath =
      locale === "tr" ? `/kategoriya/${slug}` : `/${locale}/kategori/${slug}`;

    return {
      title: `${name} | Belenay Mobilya`,
      description: description?.slice(0, 160),
      openGraph: {
        title: `${name} Mobilyaları | Belenay Mobilya`,
        description: description?.slice(0, 160),
        url: `${SITE_URL}${canonicalPath}`,
        images: [{ url: imageUrl, width: 1200, height: 630, alt: name }],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${name} | Belenay Mobilya`,
        description: description?.slice(0, 160),
        images: [imageUrl],
      },
      alternates: {
        canonical: `${SITE_URL}${canonicalPath}`,
        languages: {
          "tr-TR": `${SITE_URL}/kategori/${slug}`,
          "ru-RU": `${SITE_URL}/ru/kategori/${slug}`,
          "ky-KG": `${SITE_URL}/ky/kategori/${slug}`,
        },
      },
    };
  } catch {
    return {
      title: "Kategori | Belenay Mobilya",
      description: "Belenay Mobilya ürün kategorisi",
    };
  }
}

export default function CategoryLayout({
  children,
  params: _params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
}) {
  return <>{children}</>;
}
