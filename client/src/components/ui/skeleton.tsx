// ============================================================
// Belenay Mobilya — Skeleton Loading Bileşenleri
// Tüm sayfalarda tutarlı yükleme deneyimi için kullanılır.
// Tailwind CSS ile pulse animasyonu.
// ============================================================

import { cn } from "@/lib/utils";

// ─── Temel Skeleton Bloğu ────────────────────────────────────────────────────
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-zinc-200/80", className)}
      {...props}
    />
  );
}

// ─── Ürün Kartı Skeleton ─────────────────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm">
      {/* Görsel alanı */}
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-3">
        {/* Kategori etiketi */}
        <Skeleton className="h-4 w-20 rounded-full" />
        {/* Ürün adı */}
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        {/* Fiyat */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ─── Ürün Grid Skeleton ───────────────────────────────────────────────────────
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Ürün Detay Sayfası Skeleton ─────────────────────────────────────────────
export function ProductDetailSkeleton() {
  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left: Gallery */}
          <div className="space-y-4">
            <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
            <div className="flex gap-4 overflow-x-auto py-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-24 aspect-[4/3] rounded-2xl shrink-0" />
              ))}
            </div>
          </div>
          {/* Right: Info */}
          <div className="space-y-6 py-2">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-10 w-3/4 rounded-xl" />
              <Skeleton className="h-4 w-1/3 rounded" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-24 w-full rounded-3xl" />
            <div className="flex items-center gap-4 pt-6">
              <Skeleton className="h-12 w-32 rounded-full" />
              <Skeleton className="h-12 flex-1 rounded-full" />
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
            <div className="flex gap-4 border-t border-border pt-4">
              <Skeleton className="h-10 flex-1 rounded-full" />
              <Skeleton className="h-10 flex-1 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Kategori Kartı Skeleton ──────────────────────────────────────────────────
export function CategoryCardSkeleton() {
  return (
    <div className="relative rounded-2xl overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Skeleton className="h-5 w-3/4 bg-white/30" />
        <Skeleton className="h-3 w-1/2 mt-2 bg-white/20" />
      </div>
    </div>
  );
}

// ─── Kategori Sayfası Skeleton ────────────────────────────────────────────────
export function CategoryPageSkeleton() {
  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container-custom">
        {/* Page Header */}
        <div className="mb-12 space-y-3">
          <Skeleton className="h-12 w-64 rounded-2xl" />
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="bg-white p-6 rounded-3xl border border-border h-fit space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <Skeleton className="h-6 w-24" />
            </div>
            {/* Price Filter */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            {/* Stock Filter */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-28" />
            </div>
            {/* Subcategories */}
            <div className="space-y-3 pt-4 border-t border-border">
              <Skeleton className="h-4 w-24" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-6 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
            {/* Sort */}
            <div className="space-y-3 pt-4 border-t border-border">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden border border-border shadow-sm p-4 space-y-4">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex items-center justify-between pt-2">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Blog Kartı Skeleton ──────────────────────────────────────────────────────
export function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ─── Blog Listesi Skeleton ────────────────────────────────────────────────────
export function BlogListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Blog Detay Skeleton ──────────────────────────────────────────────────────
export function BlogDetailSkeleton() {
  return (
    <div className="container-custom max-w-4xl py-12 space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className={cn("h-4", i % 5 === 4 ? "w-2/3" : "w-full")} />
        ))}
      </div>
    </div>
  );
}

// ─── Slider Skeleton ──────────────────────────────────────────────────────────
export function SliderSkeleton() {
  return (
    <div className="relative w-full h-screen bg-zinc-200 animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4 px-8">
          <Skeleton className="h-6 w-40 mx-auto" />
          <Skeleton className="h-14 w-96 mx-auto" />
          <Skeleton className="h-14 w-80 mx-auto" />
          <Skeleton className="h-12 w-40 mx-auto rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ─── Anasayfa Skeleton ────────────────────────────────────────────────────────
export function HomePageSkeleton() {
  return (
    <div className="space-y-12">
      <SliderSkeleton />
      <div className="container-custom space-y-8">
        {/* Kategori bantları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
        {/* Ürünler */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </div>
  );
}

// ─── Sepet Satırı Skeleton ────────────────────────────────────────────────────
export function CartItemSkeleton() {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-2xl border border-zinc-100">
      <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}

// ─── Tablo Satır Skeleton (Admin) ─────────────────────────────────────────────
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} cols={cols} />
      ))}
    </>
  );
}
