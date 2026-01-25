"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

type GoogleAuthState = {
  isLoading: boolean;
  error: string | null;
};

type UseGoogleAuthReturn = {
  isLoading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
};

export function useGoogleAuth(): UseGoogleAuthReturn {
  const [state, setState] = useState<GoogleAuthState>({
    isLoading: false,
    error: null,
  });

  async function signInWithGoogle(): Promise<void> {
    setState({ isLoading: true, error: null });

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Google login error:", error);
      setState({
        isLoading: false,
        error: "Google認証に失敗しました。もう一度お試しください。",
      });
    }
  }

  return {
    isLoading: state.isLoading,
    error: state.error,
    signInWithGoogle,
  };
}
