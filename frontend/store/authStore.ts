import { create } from 'zustand';
    import { persist } from 'zustand/middleware';

    interface AuthState {
      accessToken: string | null;
      refreshToken: string | null;
      isAuthenticated: boolean;
      setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
      clearTokens: () => void;
    }

    export const useAuthStore = create<AuthState>()(
      persist(
        (set) => ({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          setTokens: ({ accessToken, refreshToken }) =>
            set({
              accessToken,
              refreshToken,
              isAuthenticated: true,
            }),
          clearTokens: () =>
            set({
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
            }),
        }),
        {
          name: 'auth-storage', // name of the item in the storage (must be unique)
        }
      )
    );
