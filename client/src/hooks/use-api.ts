import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { getImageUrl } from "@/lib/utils";

// ==========================================
// 1. DATA MAPPERS (BACKEND -> FRONTEND)
// ==========================================

export function mapProduct(backendProduct: any) {
  if (!backendProduct) return null;
  return {
    id: backendProduct.id,
    slug: backendProduct.slug,
    name: {
      tr: backendProduct.name_tr,
      ru: backendProduct.name_ru,
      ky: backendProduct.name_ky,
    },
    shortDesc: {
      tr: backendProduct.shortDesc_tr || "",
      ru: backendProduct.shortDesc_ru || "",
      ky: backendProduct.shortDesc_ky || "",
    },
    description: {
      tr: backendProduct.description_tr || "",
      ru: backendProduct.description_ru || "",
      ky: backendProduct.description_ky || "",
    },
    price: parseFloat(backendProduct.price) || 0,
    discountPrice: backendProduct.discountPrice ? parseFloat(backendProduct.discountPrice) : null,
    discountStart: backendProduct.discountStart,
    discountEnd: backendProduct.discountEnd,
    isDiscountPermanent: backendProduct.isDiscountPermanent,
    images: backendProduct.images && backendProduct.images.length > 0
      ? [...backendProduct.images].sort((a: any, b: any) => a.order - b.order).map((img: any) => getImageUrl(img.path))
      : [getImageUrl(null)],
    averageRating: parseFloat(backendProduct.averageRating) || 0,
    reviewCount: backendProduct.reviewCount || 0,
    stockQty: backendProduct.stockQty || 0,
    stockCode: backendProduct.stockCode || "",
    categories: backendProduct.categories || [],
  };
}

export function mapCategory(backendCategory: any): any {
  if (!backendCategory) return null;
  return {
    id: backendCategory.id,
    slug: backendCategory.slug,
    name: {
      tr: backendCategory.name_tr,
      ru: backendCategory.name_ru,
      ky: backendCategory.name_ky,
    },
    image: getImageUrl(backendCategory.image),
    showInHeader: backendCategory.showInHeader || false,
    order: backendCategory.order || 0,
    description: getCategoryDescription(backendCategory.slug),
    count: backendCategory.products ? backendCategory.products.length : 0,
    children: backendCategory.children ? backendCategory.children.map(mapCategory) : [],
  };
}

function getCategoryDescription(slug: string) {
  const descriptions: Record<string, Record<string, string>> = {
    "oturma-odasi": {
      tr: "Şık, konforlu ve modern oturma odası takımları, köşe koltuklar ve TV üniteleri.",
      ru: "Стильные, комфортные и современные гостиные гарнитуры, угловые диваны и ТВ-тумбы.",
      ky: "Конок бөлмө үчүн стилдүү, ыңгайлуу жана заманбап жумшак эмеректер, бурчтук дивандар жана сыналгы тумбалары."
    },
    "yatak-odasi": {
      tr: "Huzurlu bir uyku için estetik gardıroplar, şık yatak başlıkları ve komodinler.",
      ru: "Эстетичные шкафы, стильные изголовья кроватей и тумбочки для спокойного сна.",
      ky: "Тынч уйку үчүн кооз гардеробдор, стилдүү керебеттер жана тумбочкалар."
    },
    "yemek-odasi": {
      tr: "Sevdiklerinizle en güzel anları paylaşacağınız modern yemek masaları ve konsollar.",
      ru: "Современные обеденные столы и консоли, чтобы делиться лучшими моментами с близкими.",
      ky: "Жакындарыңыз менен эң сонун көз ирмемдерди бөлүшө турган заманбап тамактануучу столдор жана комоддор."
    },
    "calisma-odasi": {
      tr: "Üretkenliğinizi artıracak ergonomik çalışma masaları ve kitaplıklar.",
      ru: "Эргономичные письменные столы и книжные шкафы для повышения вашей продуктивности.",
      ky: "Өндүрүмдүүлүктү жогорулата турган эргономикалык жазуу столдору жана китеп текчелери."
    },
    "genc-odasi": {
      tr: "Gençlerin dünyasına uygun, fonksiyonel ve renkli mobilya seçenekleri.",
      ru: "Функциональные и красочные варианты мебели для молодежи.",
      ky: "Жаштардын дүйнөсүнө ылайыктуу, функционалдуу жана түркүн түстүү эмеректер."
    },
    "aksesuarlar": {
      tr: "Evinizin havasını değiştirecek şık aydınlatmalar, aynalar ve dekoratif objeler.",
      ru: "Стильные светильники, зеркала и декоративные предметы, которые изменят атмосферу вашего дома.",
      ky: "Үйүңүздүн маанайын өзгөртө турган стилдүү чырактар, күзгүлөр жана жасалгалоочу buiumdar."
    }
  };
  return descriptions[slug] || { tr: "", ru: "", ky: "" };
}

export function mapBlogPost(backendPost: any) {
  if (!backendPost) return null;
  return {
    id: backendPost.id,
    slug: backendPost.slug,
    title: {
      tr: backendPost.title_tr,
      ru: backendPost.title_ru,
      ky: backendPost.title_ky,
    },
    excerpt: {
      tr: backendPost.excerpt_tr || "",
      ru: backendPost.excerpt_ru || "",
      ky: backendPost.excerpt_ky || "",
    },
    content: {
      tr: backendPost.content_tr || "",
      ru: backendPost.content_ru || "",
      ky: backendPost.content_ky || "",
    },
    category: getBlogPostCategory(backendPost.slug),
    image: getImageUrl(backendPost.image),
    date: new Date(backendPost.publishedAt || backendPost.createdAt).toLocaleDateString('tr-TR'),
    readTime: getBlogPostReadTime(backendPost.slug),
    author: getBlogPostAuthor(backendPost.slug),
  };
}

function getBlogPostCategory(slug: string) {
  if (slug.includes('trend')) return { tr: "Trendler", ru: "Тенденции", ky: "Тренддер" };
  if (slug.includes('bakim')) return { tr: "Rehber", ru: "Руководство", ky: "Колдонмо" };
  return { tr: "Dekorasyon", ru: "Декор", ky: "Декорация" };
}

function getBlogPostReadTime(slug: string) {
  if (slug.includes('trend')) return "5 dk";
  if (slug.includes('bakim')) return "4 dk";
  return "6 dk";
}

function getBlogPostAuthor(slug: string) {
  if (slug.includes('trend')) return "Belenay Tasarım Ekibi";
  if (slug.includes('bakim')) return "Ahşap Ustası";
  return "İç Mimar Gizem Y.";
}

export function mapOrder(backendOrder: any) {
  if (!backendOrder) return null;
  return {
    id: backendOrder.id,
    status: backendOrder.status,
    totalAmount: parseFloat(backendOrder.totalAmount) || 0,
    address: backendOrder.address,
    phone: backendOrder.phone,
    receiptPath: backendOrder.receiptPath,
    adminNote: backendOrder.adminNote,
    couponCode: backendOrder.couponCode || null,
    discountAmount: parseFloat(backendOrder.discountAmount) || 0,
    createdAt: backendOrder.createdAt,
    updatedAt: backendOrder.updatedAt,
    items: (backendOrder.orderItems || []).map((item: any) => ({
      id: item.id,
      productId: item.productId,
      qty: item.qty,
      price: parseFloat(item.price) || 0,
      productName: {
        tr: item.productName_tr,
        ru: item.productName_ru,
        ky: item.productName_ky,
      },
    })),
  };
}

// ==========================================
// 2. QUERY HOOKS
// ==========================================

// --- Sliders ---
export function useSliders() {
  return useQuery({
    queryKey: ["sliders"],
    queryFn: async () => {
      const response = await apiClient.get("/homepage-design/slider");
      const data = response.data?.data;
      return (data || []).map((item: any) => ({
        id: item.id,
        image: getImageUrl(item.image),
        title: { tr: item.title_tr, ru: item.title_ru, ky: item.title_ky },
        subtitle: { tr: item.subtitle_tr, ru: item.subtitle_ru, ky: item.subtitle_ky },
        buttonText: { tr: item.buttonText_tr, ru: item.buttonText_ru, ky: item.buttonText_ky },
        buttonLink: item.buttonLink || '/',
        buttonColor: item.buttonColor,
        textColor: item.textColor
      }));
    }
  });
}

// --- Categories ---
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await apiClient.get("/categories");
      const data = response.data?.data;
      return (data || []).map(mapCategory);
    }
  });
}

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      if (!slug) return null;
      const response = await apiClient.get(`/categories/slug/${slug}`);
      return mapCategory(response.data?.data);
    },
    enabled: !!slug,
  });
}

// --- Products ---
export interface UseProductsParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'rating';
  onlyInStock?: boolean;
}

export function useProducts(params?: UseProductsParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const response = await apiClient.get("/products", { params });
      const data = response.data?.data;
      return (data || []).map(mapProduct);
    }
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      if (!slug) return null;
      const response = await apiClient.get(`/products/slug/${slug}`);
      return mapProduct(response.data?.data);
    },
    enabled: !!slug,
  });
}

// --- Blog Posts ---
export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const response = await apiClient.get("/blog");
      const data = response.data?.data;
      return (data || []).map(mapBlogPost);
    }
  });
}

export function useBlogPostBySlug(slug: string) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      if (!slug) return null;
      const response = await apiClient.get(`/blog/slug/${slug}`);
      return mapBlogPost(response.data?.data);
    },
    enabled: !!slug,
  });
}

// --- Orders ---
export function useUserOrders(userId: string | null) {
  return useQuery({
    queryKey: ["user-orders", userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiClient.get(`/orders/user/${userId}`);
      const data = response.data?.data;
      return (data || []).map(mapOrder);
    },
    enabled: !!userId,
  });
}

// --- Create Order (Mutation) ---
export function useCreateOrder() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post("/orders", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return mapOrder(response.data?.data);
    },
  });
}

// --- Coupon Validation (Mutation) ---
export function useValidateCoupon() {
  return useMutation({
    mutationFn: async ({ code, orderTotal }: { code: string; orderTotal: number }) => {
      const response = await apiClient.post("/coupons/validate", { code, orderTotal });
      return response.data?.data as {
        valid: boolean;
        code: string;
        type: string;
        value: number;
        discountAmount: number;
      };
    },
  });
}

// --- Product Reviews ---
export function useProductReviews(productId: string | null) {
  return useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      if (!productId) return [];
      const response = await apiClient.get("/reviews", {
        params: { productId, isApproved: true }
      });
      return response.data?.data || [];
    },
    enabled: !!productId,
  });
}

// --- Product Questions ---
export function useProductQuestions(productId: string | null) {
  return useQuery({
    queryKey: ["product-questions", productId],
    queryFn: async () => {
      if (!productId) return [];
      const response = await apiClient.get("/questions", {
        params: { productId }
      });
      return response.data?.data || [];
    },
    enabled: !!productId,
  });
}

// --- Create Review (Mutation) ---
export function useCreateReview() {
  return useMutation({
    mutationFn: async (data: { productId: string; userId: string; rating: number; comment: string }) => {
      const response = await apiClient.post("/reviews", data);
      return response.data?.data;
    }
  });
}

// --- Create Question (Mutation) ---
export function useCreateQuestion() {
  return useMutation({
    mutationFn: async (data: { productId: string; userId: string; question: string }) => {
      const response = await apiClient.post("/questions", data);
      return response.data?.data;
    }
  });
}

// --- Settings ---
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await apiClient.get("/settings");
      return response.data?.data || [];
    }
  });
}


