import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@belenay/shared";
import { getImageUrl } from "@/lib/utils";
import { useAuthStore } from "./useAuthStore";
import { apiClient } from "@/lib/api-client";

export const isDiscountActive = (product: any): boolean => {
  if (!product) return false;

  const discountPrice = parseFloat(product.discountPrice);
  const price = parseFloat(product.price);

  if (isNaN(discountPrice) || discountPrice <= 0 || discountPrice >= price) {
    return false;
  }

  if (product.isDiscountPermanent) {
    return true;
  }

  const now = new Date();

  if (product.discountStart) {
    const start = new Date(product.discountStart);
    if (now < start) return false;
  }

  if (product.discountEnd) {
    const end = new Date(product.discountEnd);
    if (now > end) return false;
  }

  return !!(product.discountStart || product.discountEnd);
};

interface CartState {
  items: CartItem[];
  appliedCoupon: string | null;
  discountAmount: number;
  couponLabel: string;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => Promise<void>;
  removeItem: (productId: string, variantId?: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  applyCoupon: (code: string, amount: number, label: string) => void;
  removeCoupon: () => void;
  syncCartItems: (updatedProducts: any[], currentLocale: string) => void;
  syncWithDb: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      discountAmount: 0,
      couponLabel: "",
      addItem: async (newItem) => {
        const quantityToAdd = newItem.quantity ?? 1;
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) =>
              item.productId === newItem.productId &&
              item.variantId === newItem.variantId
          );

          if (existingItemIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + quantityToAdd,
            };
            return { items: updatedItems };
          }

          return {
            items: [
              ...state.items,
              {
                ...newItem,
                quantity: quantityToAdd,
                originalPrice: newItem.originalPrice ?? newItem.price,
              },
            ],
          };
        });

        const auth = useAuthStore.getState();
        if (auth.isAuthenticated) {
          await apiClient.post("/cart", { productId: newItem.productId, quantity: quantityToAdd }).catch(console.error);
        }
      },
      removeItem: async (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(item.productId === productId && item.variantId === variantId)
          ),
        }));

        const auth = useAuthStore.getState();
        if (auth.isAuthenticated) {
          await apiClient.delete(`/cart/${productId}`).catch(console.error);
        }
      },
      updateQuantity: async (productId, quantity, variantId) => {
        if (quantity <= 0) {
          await get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, quantity }
              : item
          ),
        }));

        const auth = useAuthStore.getState();
        if (auth.isAuthenticated) {
          await apiClient.patch(`/cart/${productId}`, { quantity }).catch(console.error);
        }
      },
      clearCart: async () => {
        set({ items: [], appliedCoupon: null, discountAmount: 0, couponLabel: "" });

        const auth = useAuthStore.getState();
        if (auth.isAuthenticated) {
          await apiClient.delete("/cart").catch(console.error);
        }
      },
      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
      applyCoupon: (code, amount, label) => {
        set({
          appliedCoupon: code,
          discountAmount: amount,
          couponLabel: label,
        });
      },
      removeCoupon: () => {
        set({
          appliedCoupon: null,
          discountAmount: 0,
          couponLabel: "",
        });
      },
      syncCartItems: (updatedProducts, currentLocale) => {
        set((state) => {
          const updatedItems = state.items.map((item) => {
            const foundProduct = updatedProducts.find((p) => p.id === item.productId);
            if (foundProduct) {
              const activePrice = isDiscountActive(foundProduct)
                ? parseFloat(foundProduct.discountPrice)
                : parseFloat(foundProduct.price);

              const activeName = foundProduct.name
                ? (foundProduct.name[currentLocale as "tr" | "ru" | "ky"] || foundProduct.name["tr"] || item.name)
                : (foundProduct[`name_${currentLocale}`] || foundProduct.name_tr || item.name);

              let activeImage = item.image;
              if (foundProduct.images && foundProduct.images.length > 0) {
                const firstImg = foundProduct.images[0];
                const rawPath = typeof firstImg === "string" ? firstImg : (firstImg.path || "");
                activeImage = getImageUrl(rawPath);
              }

              return {
                ...item,
                price: activePrice || 0,
                originalPrice: parseFloat(foundProduct.price) || 0,
                name: activeName,
                image: activeImage,
              };
            }
            return item;
          });
          return { items: updatedItems };
        });
      },
      syncWithDb: async () => {
        const auth = useAuthStore.getState();
        if (!auth.isAuthenticated) return;
        try {
          const localItems = get().items.map(item => ({ productId: item.productId, quantity: item.quantity }));
          if (localItems.length > 0) {
            await apiClient.post("/cart/sync", { items: localItems }).catch(console.error);
          }
          const res = await apiClient.get("/cart");
          const dbItems = res.data?.data || [];
          const mappedItems = dbItems.map((dbItem: any) => {
            const p = dbItem.product;
            if (!p) return null;
            const primaryImg = p.images?.find((img: any) => img.isPrimary) || p.images?.[0];
            const imgPath = primaryImg ? primaryImg.path : "";
            return {
              productId: dbItem.productId,
              quantity: dbItem.quantity,
              price: isDiscountActive(p) ? parseFloat(p.discountPrice) : parseFloat(p.price),
              originalPrice: parseFloat(p.price),
              name: p.name_ru || p.name_tr || "",
              image: getImageUrl(imgPath),
            };
          }).filter(Boolean);
          set({ items: mappedItems });
        } catch (err) {
          console.error("Cart sync with DB error:", err);
        }
      }
    }),
    {
      name: "belenay-cart-storage", // localStorage key
    }
  )
);
