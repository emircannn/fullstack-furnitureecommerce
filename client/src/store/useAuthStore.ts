import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BaseUser } from "@belenay/shared";
import { toast } from "sonner";

interface AuthState {
  user: BaseUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showAuthModal: boolean;
  authModalMode: "login" | "register";
  setUser: (user: BaseUser | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setShowAuthModal: (show: boolean, mode?: "login" | "register") => void;
  logout: () => void;
}

const DEFAULT_MOCK_USER: BaseUser = {
  id: "1",
  email: "admin@belenay.com",
  firstName: "Belenay",
  lastName: "Admin",
  role: "admin",
  phone: "+90 555 555 55 55",
  gender: "other",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
} as any;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: DEFAULT_MOCK_USER,
      accessToken: "mock-jwt-token",
      isAuthenticated: true,
      isLoading: false,
      showAuthModal: false,
      authModalMode: "login",
      setUser: (user) =>
        set((state) => ({
          user: user || DEFAULT_MOCK_USER,
          isAuthenticated: true,
        })),
      setAccessToken: (token) =>
        set((state) => ({
          accessToken: token || "mock-jwt-token",
        })),
      setLoading: (isLoading) => set({ isLoading: false }),
      setShowAuthModal: (show, mode = "login") => set({ showAuthModal: show, authModalMode: mode }),
      logout: () => {
        // Oturum kapatmayı engelle, demo modunda her zaman açık kalsın.
        try {
          toast.info("Demo modunda çıkış yapılamaz. Tüm sayfalar erişime açıktır.");
        } catch {
          console.warn("Demo modunda çıkış engellendi.");
        }
      },
    }),
    {
      name: "belenay-auth-storage", // localStorage key
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // Rehydration sırasında kullanıcıyı her zaman admin'e zorla
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.user = DEFAULT_MOCK_USER;
          state.accessToken = "mock-jwt-token";
          state.isAuthenticated = true;
          state.isLoading = false;
        }
      }
    }
  )
);
