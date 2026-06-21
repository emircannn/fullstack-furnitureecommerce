import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./useAuthStore";
import { apiClient } from "@/lib/api-client";

interface FavoriteState {
  items: string[]; // List of product IDs
  addFavorite: (productId: string) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => Promise<void>;
  syncWithDb: () => Promise<void>;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      items: [],
      addFavorite: async (productId) => {
        set((state) => {
          if (state.items.includes(productId)) return state;
          return { items: [...state.items, productId] };
        });

        const auth = useAuthStore.getState();
        if (auth.isAuthenticated) {
          await apiClient.post(`/favorites/${productId}`).catch(console.error);
        }
      },
      removeFavorite: async (productId) => {
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        }));

        const auth = useAuthStore.getState();
        if (auth.isAuthenticated) {
          await apiClient.delete(`/favorites/${productId}`).catch(console.error);
        }
      },
      toggleFavorite: async (productId) => {
        const isFav = get().isFavorite(productId);
        if (isFav) {
          await get().removeFavorite(productId);
        } else {
          await get().addFavorite(productId);
        }
      },
      isFavorite: (productId) => {
        return get().items.includes(productId);
      },
      clearFavorites: async () => {
        set({ items: [] });
      },
      syncWithDb: async () => {
        const auth = useAuthStore.getState();
        if (!auth.isAuthenticated) return;
        try {
          const localIds = get().items;
          for (const productId of localIds) {
            await apiClient.post(`/favorites/${productId}`).catch(() => {});
          }
          const res = await apiClient.get("/favorites");
          const dbFavs = res.data?.data || [];
          const dbIds = dbFavs.map((fav: any) => fav.productId);
          set({ items: dbIds });
        } catch (err) {
          console.error("Favorites sync with DB error:", err);
        }
      }
    }),
    {
      name: "belenay-favorites-storage", // localStorage key
    }
  )
);
