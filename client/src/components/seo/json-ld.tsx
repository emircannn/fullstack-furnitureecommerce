// ============================================================
// Belenay Mobilya — JSON-LD Structured Data Bileşenleri
// Google Search'te zengin sonuç (rich result) için kullanılır.
// ============================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://belenay.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ─── Organization JSON-LD ─────────────────────────────────────────────────────
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Belenay Mobilya",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/assets/logo.svg`,
      width: 200,
      height: 60,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: ["Turkish", "Russian", "Kyrgyz"],
      },
    ],
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── WebSite JSON-LD (SearchAction) ──────────────────────────────────────────
export function WebsiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "Belenay Mobilya",
    description: "Kaliteli ve şık mobilya çözümleri",
    inLanguage: ["tr", "ru", "ky"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/kategoriler?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── Product JSON-LD ─────────────────────────────────────────────────────────
interface ProductJsonLdProps {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  imageUrls?: string[];
  slug: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  brand?: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
}

export function ProductJsonLd({
  name,
  description,
  price,
  currency = "TRY",
  imageUrls = [],
  slug,
  availability = "InStock",
  brand = "Belenay Mobilya",
  sku,
  rating,
  reviewCount,
}: ProductJsonLdProps) {
  const productUrl = `${SITE_URL}/urun/${slug}`;
  const images = imageUrls.map((url) =>
    url.startsWith("http") ? url : `${API_URL}${url}`
  );

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}/#product`,
    name,
    description,
    url: productUrl,
    image: images.length > 0 ? images : [`${SITE_URL}/assets/og-image.jpg`],
    brand: {
      "@type": "Brand",
      name: brand,
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: currency,
      price: price.toFixed(2),
      availability: `https://schema.org/${availability}`,
      seller: {
        "@type": "Organization",
        name: "Belenay Mobilya",
      },
    },
  };

  if (sku) data.sku = sku;
  if (rating && reviewCount) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.toFixed(1),
      reviewCount,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── BreadcrumbList JSON-LD ───────────────────────────────────────────────────
interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.href.startsWith("http") ? item.href : `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── LocalBusiness JSON-LD ───────────────────────────────────────────────────
export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    "@id": `${SITE_URL}/#localbusiness`,
    name: "Belenay Mobilya",
    url: SITE_URL,
    image: `${SITE_URL}/assets/logo.svg`,
    priceRange: "$$",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "18:00",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── Article JSON-LD (Blog) ───────────────────────────────────────────────────
interface ArticleJsonLdProps {
  title: string;
  excerpt?: string;
  slug: string;
  imageUrl?: string;
  publishedAt?: string;
  updatedAt?: string;
}

export function ArticleJsonLd({
  title,
  excerpt,
  slug,
  imageUrl,
  publishedAt,
  updatedAt,
}: ArticleJsonLdProps) {
  const articleUrl = `${SITE_URL}/blog/${slug}`;
  const image = imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : `${API_URL}${imageUrl}`
    : `${SITE_URL}/assets/og-image.jpg`;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${articleUrl}/#article`,
    headline: title,
    description: excerpt,
    url: articleUrl,
    image,
    author: {
      "@type": "Organization",
      name: "Belenay Mobilya",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Belenay Mobilya",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/assets/logo.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
  };

  if (publishedAt) data.datePublished = publishedAt;
  if (updatedAt) data.dateModified = updatedAt;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
