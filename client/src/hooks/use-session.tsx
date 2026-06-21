// ============================================================
// Belenay Mobilya - Auth Session Hook (Sunucu Bileşeni Uyumlu)
// Next.js App Router için server-side session yönetimi.
// Cookie'den refresh token ile oturum durumunu kontrol eder.
// ============================================================

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser, getCurrentUser, getAccessToken } from '@/lib/auth-client';

// ---- Session Context Tipi ----
interface SessionContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
}

// ---- Session Context ----
const SessionContext = createContext<SessionContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: () => {},
});

// ---- Session Provider Props ----
interface SessionProviderProps {
  children: ReactNode;
  // Server-side'dan gelen başlangıç kullanıcı verisi (isteğe bağlı)
  initialUser?: AuthUser | null;
}

/**
 * Uygulama genelinde oturum state'ini sağlayan provider.
 * _app.tsx veya layout.tsx'e eklenmelidir.
 */
export function SessionProvider({ children, initialUser = null }: SessionProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState<boolean>(!initialUser);

  useEffect(() => {
    // Başlangıç kullanıcısı yoksa ve access token varsa kullanıcıyı yükle
    if (!initialUser) {
      const token = getAccessToken();
      if (token) {
        getCurrentUser()
          .then(setUser)
          .catch(() => setUser(null))
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    }
  }, [initialUser]);

  return (
    <SessionContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        setUser,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

/**
 * Session context'ine erişim hook'u.
 *
 * @example
 * const { user, isAuthenticated } = useSession();
 */
export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession, SessionProvider içinde kullanılmalıdır');
  }
  return context;
}
