// ============================================================
// Belenay Mobilya - useAuth Hook
// Kimlik doğrulama state'ini yöneten React hook.
// Kullanıcı oturumu, giriş, çıkış ve OAuth işlemlerini
// Zustand store ile senkronize eder.
// ============================================================

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AuthUser,
  LoginData,
  RegisterData,
  getCurrentUser,
  login,
  loginWithApple,
  loginWithGoogle,
  logout,
  register,
} from '@/lib/auth-client';

// ---- Hook Durum Tipi ----
export interface UseAuthState {
  // Giriş yapmış kullanıcı (null ise oturum yok)
  user: AuthUser | null;
  // Yükleniyor durumu
  isLoading: boolean;
  // Kullanıcı giriş yapmış mı
  isAuthenticated: boolean;
  // Admin mi?
  isAdmin: boolean;
  // Hata mesajı
  error: string | null;
}

// ---- Hook Aksiyon Tipi ----
export interface UseAuthActions {
  // Email + şifre ile kayıt ol
  handleRegister: (data: RegisterData) => Promise<void>;
  // Email + şifre ile giriş yap
  handleLogin: (data: LoginData) => Promise<void>;
  // Çıkış yap
  handleLogout: () => Promise<void>;
  // Google ile giriş başlat
  handleGoogleLogin: () => void;
  // Apple ile giriş başlat
  handleAppleLogin: () => void;
  // Hata mesajını temizle
  clearError: () => void;
  // Mevcut kullanıcıyı yenile
  refreshUser: () => Promise<void>;
}

/**
 * Kimlik doğrulama işlemlerini yöneten merkezi hook.
 * Oturum durumunu yerel state'te tutar ve API ile senkronize eder.
 *
 * @example
 * const { user, isAuthenticated, handleLogin, handleLogout } = useAuth();
 */
export function useAuth(): UseAuthState & UseAuthActions {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Kullanıcı Bilgilerini Yükle ----
  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      // Token yok veya geçersiz - kullanıcı oturum açmamış
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ---- İlk Yükleme: Oturum Kontrolü ----
  useEffect(() => {
    // Sayfa yüklendiğinde mevcut oturumu kontrol et
    refreshUser();
  }, [refreshUser]);

  // ---- Kayıt ----
  const handleRegister = useCallback(
    async (data: RegisterData) => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await register(data);
        setUser(result.user);
        // Kayıt sonrası ana sayfaya yönlendir
        router.push('/');
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Kayıt sırasında bir hata oluştu';
        setError(Array.isArray(message) ? message[0] : message);
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  // ---- Giriş ----
  const handleLogin = useCallback(
    async (data: LoginData) => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await login(data);
        setUser(result.user);
        // Admin ise panel'e, değilse ana sayfaya yönlendir
        if (result.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Giriş sırasında bir hata oluştu';
        setError(Array.isArray(message) ? message[0] : message);
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  // ---- Çıkış ----
  const handleLogout = useCallback(async () => {
    try {
      setIsLoading(true);
      await logout();
      setUser(null);
      // Giriş sayfasına yönlendir
      router.push('/vhod');
    } catch {
      // Hata olsa da local state'i temizle
      setUser(null);
      router.push('/vhod');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // ---- Google ile Giriş ----
  const handleGoogleLogin = useCallback(() => {
    setError(null);
    loginWithGoogle();
  }, []);

  // ---- Apple ile Giriş ----
  const handleAppleLogin = useCallback(() => {
    setError(null);
    loginWithApple();
  }, []);

  // ---- Hata Temizle ----
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    user,
    isLoading,
    isAuthenticated: user !== null,
    isAdmin: user?.role === 'admin',
    error,
    // Aksiyonlar
    handleRegister,
    handleLogin,
    handleLogout,
    handleGoogleLogin,
    handleAppleLogin,
    clearError,
    refreshUser,
  };
}
