import { useEffect, useState } from "react";
import { AuthError, Session } from "@supabase/supabase-js";
import { AuthMode } from "../types";
import { formatSupabaseError } from "../utils/supabase";
import { getSupabaseClient, isSupabaseConfiguredFlag } from "../utils/supabaseClient";

let cachedSession: Session | null = null;
let hasCheckedSession = false;

export function useAuth() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [session, setSession] = useState<Session | null>(cachedSession);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    if (!hasCheckedSession) {
      supabase.auth.getSession().then(({ data }) => {
        cachedSession = data.session;
        hasCheckedSession = true;
        setSession(data.session);
      });
    }

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      cachedSession = nextSession;
      hasCheckedSession = true;
      setSession(nextSession);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  async function handleAuthSubmit(email: string, password: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setMessage("");

    if (authMode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(formatSupabaseError(error));
        return;
      }
      if (data?.session) {
        cachedSession = data.session;
        setSession(data.session);
      }
      setMessage("登録しました。確認メールが有効な場合はメール認証後にログインしてください。");
      return;
    }

    if (authMode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'}/reset-password`,
      });
      if (error) {
        setMessage(formatSupabaseError(error));
        return;
      }
      setMessage("パスワードリセットのメールを送信しました。メールを確認してください。");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(formatSupabaseError(error));
      return;
    }
    if (data?.session) {
      cachedSession = data.session;
      setSession(data.session);
    }
    setMessage("ログインしました。");
  }

  function switchAuthMode() {
    setAuthMode((mode) => (mode === "login" ? "signup" : mode === "signup" ? "reset" : "login"));
    setMessage("");
  }

  function resetToResetMode() {
    setAuthMode("reset");
    setMessage("");
  }

  return {
    authMode,
    session,
    message,
    isSupabaseConfigured: isSupabaseConfiguredFlag(),
    handleAuthSubmit,
    switchAuthMode,
    resetToResetMode,
    supabase: getSupabaseClient(),
  };
}
