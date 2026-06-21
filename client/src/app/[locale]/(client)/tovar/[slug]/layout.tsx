import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://belenay.com";
const API_URL = process.env.API_URL || "http://localhost:3001";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const res = await fetch(`${API_URL}/products/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("not found");

    const product = await res.json();

    // Dile göre çeviriden isim al
    const name =
      product.translations?.find((t: { locale: string; name?: string }) => t.locale === locale)?.name ||
      product.translations?.[0]?.name ||
      product.slug;

    const description =
      product.translations?.find((t: { locale: string; description?: string }) => t.locale === locale)?.description ||
      product.translations?.[0]?.description ||
      `${name} - Belenay Mobilya`;

    const price = product.discountedPrice || product.price;
    const imageUrl =
      product.images?.[0]?.url
        ? `${API_URL}${product.images[0].url}`
        : `${SITE_URL}/assets/og-image.jpg`;

    const canonicalPath = locale === "tr" ? `/tovar/${slug}` : `/${locale}/urun/${slug}`;

    return {
      title: `${name} | Belenay Mobilya`,
      description: description?.slice(0, 160),
      openGraph: {
        title: `${name} | Belenay Mobilya`,
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
          "tr-TR": `${SITE_URL}/urun/${slug}`,
          "ru-RU": `${SITE_URL}/ru/urun/${slug}`,
          "ky-KG": `${SITE_URL}/ky/urun/${slug}`,
        },
      },
    };
  } catch {
    return {
      title: "Ürün | Belenay Mobilya",
      description: "Belenay Mobilya ürün detayı",
    };
  }
}

export default function ProductLayout({
  children,
  params: _params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
}) {
  return <>{children}</>;
}
