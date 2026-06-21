"use client";

import React from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { apiClient } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params?.locale as string) || "tr";
  
  const { setUser, setAccessToken, setLoading } = useAuthStore();
  const isProcessing = React.useRef(false);

  React.useEffect(() => {
    let token = searchParams.get("token");
    if (!token && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      token = urlParams.get("token");
    }

    if (!token) {
      toast.error("Kimlik doğrulama başarısız: Token bulunamadı");
      router.replace(`/${locale}/giris`);
      return;
    }

    if (isProcessing.current) return;
    isProcessing.current = true;

    const processToken = (tokenStr: string) => {
      setLoading(true);
      
      // Set token in localStorage, useAuthStore and apiClient
      if (typeof window !== "undefined") {
        localStorage.setItem("belenay_access_token", tokenStr);
      }
      setAccessToken(tokenStr);

      // Fetch user details from /api/auth/me
      apiClient
        .get("/auth/me")
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            const rawUser = res.data.data;
            
            // Format user to match expected store structure
            const baseUser: any = {
              id: rawUser.id,
              email: rawUser.email,
              firstName: rawUser.name?.split(" ")[0] || rawUser.name || "Kullanıcı",
              lastName: rawUser.name?.split(" ").slice(1).join(" ") || "",
              role: rawUser.role === "admin" ? "admin" : "user",
              isVerified: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            setUser(baseUser);
            toast.success("Giriş Başarılı", {
              description: `Hoş geldiniz!`,
            });

            if (rawUser.role === "admin") {
              router.replace(`/${locale}/admin`);
            } else {
              router.replace(`/${locale}`);
            }
          } else {
            throw new Error("Kullanıcı bilgisi alınamadı");
          }
        })
        .catch((err) => {
          console.error("Auth callback verification error:", err);
          toast.error("Kimlik doğrulanırken bir hata oluştu");
          router.replace(`/${locale}/giris`);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    processToken(token);
  }, [searchParams, router, locale, setUser, setAccessToken, setLoading]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
        <h2 className="text-lg font-bold text-secondary">Giriş doğrulanıyor...</h2>
        <p className="text-sm text-muted-foreground">Lütfen bekleyiniz, yönlendiriliyorsunuz.</p>
      </div>
    </div>
  );
}
